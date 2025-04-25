// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Event is ERC721, ReentrancyGuard {
    // Event parameters
    string public eventName;
    uint256 public eventDate;        // Unix timestamp
    uint256 public ticketPrice;      // in wei
    uint256 public maxSupply;
    uint256 public sold;
    address public organizer;

    // Ticket bookkeeping
    uint256 private nextTicketId;
    uint256[] private soldTickets;

    // Owner → their token IDs
    mapping(address => uint256[]) private ownerTokens;
    mapping(uint256 => uint256) private ticketIndexInOwner;

    event TicketPurchased(address indexed buyer, uint256 indexed ticketId);
    event TicketTransferred(address indexed from, address indexed to, uint256 indexed ticketId);

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Not organizer");
        _;
    }

    constructor(
        string memory _name,
        uint256 _date,
        uint256 _price,
        uint256 _supply,
        address _organizer
    ) ERC721("EventTicket", "ETIX") {
        eventName   = _name;
        eventDate   = _date;
        ticketPrice = _price;
        maxSupply   = _supply;
        organizer   = _organizer;
    }

    /// @notice Purchase a ticket at fixed price
    function buyTicket() external payable nonReentrant {
        require(block.timestamp <= eventDate, "Event passed");
        require(sold < maxSupply, "Sold out");
        require(msg.value == ticketPrice, "Incorrect ETH sent");

        uint256 tid = ++nextTicketId;
        sold += 1;
        _safeMint(msg.sender, tid);

        // track sold tickets for organizer
        soldTickets.push(tid);

        // track ownerTokens
        ticketIndexInOwner[tid] = ownerTokens[msg.sender].length;
        ownerTokens[msg.sender].push(tid);

        // forward funds
        payable(organizer).transfer(msg.value);

        emit TicketPurchased(msg.sender, tid);
    }

    /// @notice Peer-to-peer transfer of a ticket
    function transferTicket(address to, uint256 ticketId) external nonReentrant {
        require(ownerOf(ticketId) == msg.sender, "Not owner");
        _safeTransfer(msg.sender, to, ticketId, "");

        // update ownerTokens mapping
        _removeTokenFrom(msg.sender, ticketId);
        ticketIndexInOwner[ticketId] = ownerTokens[to].length;
        ownerTokens[to].push(ticketId);

        emit TicketTransferred(msg.sender, to, ticketId);
    }

    /// @notice View all tickets the caller owns
    function getMyTickets() external view returns (uint256[] memory) {
        return ownerTokens[msg.sender];
    }

    /// @notice View all sold ticket IDs (organizer only)
    function getSoldTickets() external view onlyOrganizer returns (uint256[] memory) {
        return soldTickets;
    }

    /// @dev Internal helper to remove a token from an owner's list
    function _removeTokenFrom(address from, uint256 ticketId) internal {
        uint256 idx = ticketIndexInOwner[ticketId];
        uint256 lastId = ownerTokens[from][ownerTokens[from].length - 1];

        // swap & pop
        ownerTokens[from][idx] = lastId;
        ticketIndexInOwner[lastId] = idx;

        ownerTokens[from].pop();
    }
}
