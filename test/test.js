const { assert } = require("chai");
const Web3 = require("web3");

const Decentragram = artifacts.require("./Decentragram.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Decentragram", ([deployer, author, tipper]) => {
  let decentragram;

  before(async () => {
    decentragram = await Decentragram.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await decentragram.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await decentragram.name();
      assert.equal(name, "Decentragram");
    });
  });

  describe("images", async () => {
    let result;
    const hash = "uiljsldfajdfkdfadsakdkdkd";
    const dummyDescription = "Description";
    let imageCount;

    before(async () => {
      result = await decentragram.uploadImage(hash, dummyDescription, {
        from: author,
      });
      imageCount = await decentragram.imageCount();
    });

    it("creates images", async () => {
      assert.equal(imageCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(event.hash, hash, "Hash is correct");
      assert.equal(event.tipAmount, "0", "Tip amount is correct");
      assert.equal(event.author, author, "Author is correct");

      // FAILURE: Image must have hash
      await decentragram.uploadImage("", dummyDescription, { from: author })
        .should.be.rejected;
      await decentragram.uploadImage(hash, "", { from: author }).should.be
        .rejected;
    });

    it("lists images", async () => {
      const image = await decentragram.images(imageCount);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(image.hash, hash, "Hash is correct");
      assert.equal(image.tipAmount, "0", "Tip amount is correct");
      assert.equal(image.author, author, "Author is correct");
    });

    it("allows users to tip images", async () => {
      console.log("WEB3 eth", Web3);
      let oldAuthorBalance = await Web3.eth.getBalance(author);

      oldAuthorBalance = new Web3.utils.BN(oldAuthorBalance);
      result = await decentragram.tipImageOwner(imageCount, {
        from: tipper,
        value: Web3.utils.toWei("1", "Ether"),
      });

      // SUCCESS
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(event.hash, hash, "Hash is correct");
      assert.equal(event.tipAmount, "0", "Tip amount is correct");
      assert.equal(event.author, author, "Author is correct");

      // Check that author received funds
      let newAuthorBalance = await Web3.eth.getBalance(author);
      newAuthorBalance = new Web3.utils.BN(newAuthorBalance);

      let tipImageOwner = Web3.utils.toWei("1", "Ether");
      tipImageOwner = new Web3.utils.BN(tipImageOwner);

      const expectedBalance = oldAuthorBalance.add(tipImageOwner);
      assert.equal(expectedBalance.toString(), newAuthorBalance.toString());

      // FAILURE: Tries to tip an image that does not exist
      await await decentragram.tipImageOwner(99, {
        from: tipper,
        value: Web3.utils.toWei("1", "Ether"),
      });
    });
  });
});
