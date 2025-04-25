// scripts/script.js
const { ethers } = require("hardhat");

async function main() {
  // ──────────────────────────────────────────
  // 1) SIGNERS
  console.log("\n🛡️  SIGNERS");
  console.log("──────────────────────────────────────────");
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  console.log(` • Deployer: ${deployer.address}`);
  console.log(` • User1:    ${user1.address}`);
  console.log(` • User2:    ${user2.address}`);
  console.log(` • User3:    ${user3.address}\n`);

  // Build a quick lookup for organizer calls
  const signers = {
    [deployer.address.toLowerCase()]: deployer,
    [user1.address.toLowerCase()]:    user1,
    [user2.address.toLowerCase()]:    user2,
    [user3.address.toLowerCase()]:    user3,
  };

  // ──────────────────────────────────────────
  // 2) DEPLOY FACTORY
  console.log("🏭 DEPLOYING EventFactory");
  console.log("──────────────────────────────────────────");
  const Factory = await ethers.getContractFactory("EventFactory");
  const factory = await Factory.deploy();
  if (factory.waitForDeployment) await factory.waitForDeployment();
  else                   await factory.deployed();
  const factoryAddr = factory.target ?? factory.address;
  console.log(` • Factory Address: ${factoryAddr}\n`);

  // ──────────────────────────────────────────
  // 3) CREATE EVENTS
  console.log("🆕 CREATING EVENTS");
  console.log("──────────────────────────────────────────");
  const now     = Math.floor(Date.now() / 1000);
  const oneWeek = now + 7 * 24 * 3600;

  // Event One by User1
  await (await factory.connect(user1).createEvent(
    "Event One", oneWeek, ethers.parseEther("0.05"), 5
  )).wait();
  console.log(` • [Event One] created by User1 (${user1.address})`);

  // Event Two by User2
  await (await factory.connect(user2).createEvent(
    "Event Two", oneWeek, ethers.parseEther("0.02"), 5
  )).wait();
  console.log(` • [Event Two] created by User2 (${user2.address})`);

  const [ev1Addr, ev2Addr] = await factory.getAllEvents();
  console.log(`\n • Deployed Event Addresses:\n     - Event One: ${ev1Addr}\n     - Event Two: ${ev2Addr}\n`);

  const Event = await ethers.getContractFactory("Event");
  const ev1 = Event.attach(ev1Addr);
  const ev2 = Event.attach(ev2Addr);

  // ──────────────────────────────────────────
  // 4) BUYING TICKETS
  console.log("💰 BUYING TICKETS");
  console.log("──────────────────────────────────────────");
  await (await ev1.connect(user1).buyTicket({ value: ethers.parseEther("0.05") })).wait();
  console.log(` • User1 bought 1 ticket from Event One`);
  await (await ev1.connect(user2).buyTicket({ value: ethers.parseEther("0.05") })).wait();
  console.log(` • User2 bought 1 ticket from Event One`);
  await (await ev2.connect(user3).buyTicket({ value: ethers.parseEther("0.02") })).wait();
  console.log(` • User3 bought 1 ticket from Event Two`);
  await (await ev2.connect(user1).buyTicket({ value: ethers.parseEther("0.02") })).wait();
  console.log(` • User1 bought 1 ticket from Event Two\n`);

  // ──────────────────────────────────────────
  // 5) TRANSFERRING TICKETS
  console.log("✉️  TRANSFERRING TICKETS");
  console.log("──────────────────────────────────────────");
  let tickets = await ev1.connect(user2).getMyTickets();
  await (await ev1.connect(user2).transferTicket(user3.address, tickets[0])).wait();
  console.log(` • User2 → User3: Event One Ticket #${tickets[0]}`);

  tickets = await ev2.connect(user1).getMyTickets();
  await (await ev2.connect(user1).transferTicket(user2.address, tickets[0])).wait();
  console.log(` • User1 → User2: Event Two Ticket #${tickets[0]}\n`);

  // ──────────────────────────────────────────
  // 6) EVENT-WISE OVERVIEW
  console.log("📊 EVENT-WISE OVERVIEW");
  console.log("──────────────────────────────────────────");
  for (const [i, ev] of [[1, ev1], [2, ev2]]) {
    const addr    = i === 1 ? ev1Addr : ev2Addr;
    const name    = await ev.eventName();
    const orgAddr = await ev.organizer();
    const sold    = await ev.connect(signers[orgAddr.toLowerCase()]).getSoldTickets();

    console.log(`\n>> Event ${i}: "${name}" @ ${addr}`);
    console.log("   Sold Tickets:");
    for (const id of sold) {
      const owner = await ev.ownerOf(id);
      console.log(`     • Ticket #${id.toString()} → Owner: ${owner}`);
    }
  }
  console.log();

  // ──────────────────────────────────────────
  // 7) USER-WISE OVERVIEW
  console.log("👥 USER-WISE OVERVIEW");
  console.log("──────────────────────────────────────────");
  for (const user of [user1, user2, user3]) {
    console.log(`\n>> User: ${user.address}`);
    for (const [i, ev] of [[1, ev1], [2, ev2]]) {
      const name     = await ev.eventName();
      const holding  = await ev.connect(user).getMyTickets();
      if (holding.length === 0) continue;
      console.log(`   • ${name} — Tickets:`);
      holding.forEach(id =>
        console.log(`     ▸ #${id.toString()}`)
      );
    }
  }
  console.log("\n🎉 All operations complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Script error:", err);
    process.exit(1);
  });
