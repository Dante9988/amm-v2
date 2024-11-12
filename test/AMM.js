const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const formatEther = (n) => {
  return ethers.utils.formatUnits(n, 'ether');
}

const ether = tokens
const shares = ether

describe('AMM', () => {
  let accounts, 
  deployer,
  liquidityProvider
  let token1, 
  token2, 
  amm;

  let transaction, result;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    liquidityProvider = accounts[1];

    const Token = await ethers.getContractFactory('Token');
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000');
    token2 = await Token.deploy('USD Token', 'USD', '1000000');

    transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000));
    result = await transaction.wait();

    transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000));
    result = await transaction.wait();

    const AMM = await ethers.getContractFactory('AMM');
    amm = await AMM.deploy(token1.address, token2.address);

    
  
  });

  describe('Deployment', () => {

    it('has an address', async () => {
      expect(amm.address).to.not.equal(0x0);
    })

    it('tracks token1 address', async () => {
      expect(await amm.token1()).to.equal(token1.address);
    })

    it('tracks token2 address', async () => {
      expect(await amm.token2()).to.equal(token2.address);
    })

  })
  
  describe('Swapping tokens', () => {

    it('facilitates swaps', async () => {
      let amount = tokens(100000);
      // Approve tokens
      transaction = await token1.connect(deployer).approve(amm.address, amount);
      result = await transaction.wait();

      transaction = await token2.connect(deployer).approve(amm.address, amount);
      result = await transaction.wait();

      // Deployer adds liquidity
      transaction = await amm.connect(deployer).addLiquidity(amount, amount);
      result = await transaction.wait();

      // Check AMM received tokens
      expect(await token1.balanceOf(amm.address)).to.equal(amount);
      expect(await token2.balanceOf(amm.address)).to.equal(amount);

      // Check token balances
      expect(await amm.token1Balance()).to.equal(amount);
      expect(await amm.token2Balance()).to.equal(amount);
      // Check K
      expect(await amm.K()).to.equal(amount.mul(amount));

      // Check shares
      expect(await amm.shares(deployer.address)).to.eq(tokens(100));
      expect(await amm.totalShares()).to.eq(tokens(100));

      // LP Adds more liquidity
      amount = tokens(50000);
      transaction = await token1.connect(liquidityProvider).approve(amm.address, amount);
      result = await transaction.wait();

      transaction = await token2.connect(liquidityProvider).approve(amm.address, amount);
      result = await transaction.wait();

      // Calculate token2 deposit
      const token2Deposit = await amm.calculateToken2Deposit(amount);
      transaction = await amm.connect(liquidityProvider).addLiquidity(amount, token2Deposit);
      result = await transaction.wait();

      // Check shares
      expect(await amm.shares(liquidityProvider.address)).to.eq(tokens(50));

      // deployer should have 100 shares
      expect(await amm.shares(deployer.address)).to.eq(tokens(100));

      // pool should have 150 shares
      expect(await amm.totalShares()).to.eq(tokens(150));
    })

  })
  

})
