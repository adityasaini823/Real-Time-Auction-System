const socket = io();

// Listen for bid updates
socket.on('bidUpdate', (data) => {
  console.log('New bid received:', data);
});

socket.on('auctionClosed', (data) => {
  console.log('Auction closed:', data);
});




