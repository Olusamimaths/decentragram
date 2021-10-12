pragma solidity ^0.5.0;

contract Decentragram {
  string public name = "Decentragram";
  
  // Store images
  uint public imageCount = 0;
  mapping(uint => Image) public images;
  
  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );
  
  event ImageTipped (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );
  // Create Images
  function uploadImage(string memory imgHash, string memory description) public {
    require(bytes(description).length > 0);
    require(bytes(imgHash).length > 0);

    require(msg.sender != address(0x0));

    imageCount++;

    uint tipAmount = 0;
    images[imageCount] = Image(1, imgHash, description, tipAmount, msg.sender); // msg is a global variable

    emit ImageCreated(imageCount, imgHash, description, tipAmount, msg.sender);
  }
  
  // Tip Images

  function tipImageOwner(uint id) public payable {
    require(id > 0 && id <= imageCount);
    Image memory image = images[id];
    // Fetch the author
    address payable authorAddress = image.author;
    // Pay the author by sending them Ether
    address(authorAddress).transfer(msg.value);
    // Increment image tip amount
    image.tipAmount = image.tipAmount + msg.value;
    // update the image in the map
    images[id] = image;    

    emit ImageTipped(id, image.hash, image.description, image.tipAmount, msg.sender);
  }
}