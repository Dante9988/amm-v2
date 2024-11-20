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
  liquidityProvider,
  investor1,
  investor2,
  token1, 
  token2, 
  amm;

  let transaction, result, estimate;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    liquidityProvider = accounts[1];
    investor1 = accounts[2];
    investor2 = accounts[3];

    const Token = await ethers.getContractFactory('Token');
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000');
    token2 = await Token.deploy('USD Token', 'USD', '1000000');

    // Deployer transfers tokens 1 to liquidity provider
    transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000));
    result = await transaction.wait();

    // Deployer transfers tokens 2 to liquidity provider
    transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000));
    result = await transaction.wait();

    // Deployer transfers tokens 1 to investor 1
    transaction = await token1.connect(deployer).transfer(investor1.address, tokens(100000));
    result = await transaction.wait();

    // Deployer transfers tokens 2 to investor 2
    transaction = await token2.connect(deployer).transfer(investor2.address, tokens(100000));
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

      //////////////////////////////////////////////////////////////////////////////
      // Investor 1 swaps
      //////////////////////////////////////////////////////////////////////////////

      // Check price before swap
      let priceBefore = await amm.token2Balance() / await amm.token1Balance();
      console.log('Price before swap: ', priceBefore);

      // Investor 1 approves tokens
      transaction = await token1.connect(investor1).approve(amm.address, tokens(100000));
      await transaction.wait();

      // Check investor1 balance before swap
      balance = await token2.balanceOf(investor1.address);
      console.log('Investor1 token2 balance before swap: ', formatEther(balance));
      // Estimate amount of tokens investor1 will receive after swapping token1: include slippage
      estimate = await amm.calculateToken1Swap(tokens(1));
      console.log('Estimate token2 amount: ', formatEther(estimate));
      // Investor1 swaps 1 token1
      transaction = await amm.connect(investor1).swapExactInput(tokens(1));
      result = await transaction.wait();

      // Check investor1 balance after swap
      balance = await token2.balanceOf(investor1.address);
      expect(balance).to.equal(estimate);
      let estimate1 = estimate;
      console.log('Investor1 token2 balance after swap: ', formatEther(balance));

      // Check AMM token balances are in sync
      let ammToken1Balance = await amm.token1Balance();
      let ammToken2Balance = await amm.token2Balance();
      expect(await token1.balanceOf(amm.address)).to.eq(ammToken1Balance);
      expect(await token2.balanceOf(amm.address)).to.eq(ammToken2Balance);

      // Check event was emitted
      await expect(transaction).to.emit(amm, 'Swap')
      .withArgs(
        investor1.address, 
        token1.address, 
        tokens(1), 
        token2.address, 
        estimate, 
        ammToken1Balance, 
        ammToken2Balance, 
        (await ethers.provider.getBlock('latest')).timestamp
      );

      //////////////////////////////////////////////////////////////////////////////
      // Investor 1 swaps some more tokens
      //////////////////////////////////////////////////////////////////////////////

      // Swap some more tokens to see what happens
      balance = await token2.balanceOf(investor1.address);
      console.log('Investor1 token2 balance before swap: ', formatEther(balance));

      estimate = await amm.calculateToken1Swap(tokens(1));
      console.log('Estimate token2 amount: ', formatEther(estimate));
      let estimate2 = estimate;
      transaction = await amm.connect(investor1).swapExactInput(tokens(1));
      result = await transaction.wait();

      await expect(transaction).to.emit(amm, 'Swap')
      .withArgs(
        investor1.address, 
        token1.address, 
        tokens(1), 
        token2.address, 
        estimate, 
        await amm.token1Balance(), 
        await amm.token2Balance(), 
        (await ethers.provider.getBlock('latest')).timestamp
      );

      balance = await token2.balanceOf(investor1.address);
      console.log('Investor1 token2 balance after swap: ', formatEther(balance));
      expect(balance).to.equal(estimate1.add(estimate2));

      // Check price after swap
      let priceAfter = await amm.token2Balance() / await amm.token1Balance();
      console.log('Price after swap: ', priceAfter);

      // Check price after is less than price before
      expect(priceAfter).to.be.lessThan(priceBefore);

      //////////////////////////////////////////////////////////////////////////////
      // Investor 1 swaps large amount of tokens
      //////////////////////////////////////////////////////////////////////////////

      balance = await token2.balanceOf(investor1.address);
      console.log('Investor1 token2 balance before swap: ', formatEther(balance));

      estimate = await amm.calculateToken1Swap(tokens(100));
      console.log('Estimate token2 amount: ', formatEther(estimate));
      let estimate3 = estimate;

      transaction = await amm.connect(investor1).swapExactInput(tokens(100));
      result = await transaction.wait();

      await expect(transaction).to.emit(amm, 'Swap')
      .withArgs(
        investor1.address, 
        token1.address, 
        tokens(100), 
        token2.address, 
        estimate, 
        await amm.token1Balance(), 
        await amm.token2Balance(), 
        (await ethers.provider.getBlock('latest')).timestamp
      );

      balance = await token2.balanceOf(investor1.address);
      console.log('Investor1 token2 balance after swap: ', formatEther(balance));
      expect(balance).to.equal(estimate1.add(estimate2).add(estimate3));

      // Check price after swap
      let priceAfter2 = await amm.token2Balance() / await amm.token1Balance();
      console.log('Price after swap: ', priceAfter2);

      // Check price after is less than price before
      expect(priceAfter2).to.be.lessThan(priceAfter);

      //////////////////////////////////////////////////////////////////////////////
      // Investor 2 swaps
      //////////////////////////////////////////////////////////////////////////////

      // investor2 approves tokens
      transaction = await token2.connect(investor2).approve(amm.address, tokens(100000));
      await transaction.wait();

      // Check investor2 balance before swap
      balance = await token1.balanceOf(investor2.address);
      console.log('Investor2 token1 balance before swap: ', formatEther(balance));

      // Estimate amount of tokens investor2 will receive after swapping token2: include slippage
      estimate = await amm.calculateToken2Swap(tokens(1));
      console.log('Estimate token1 amount: ', formatEther(estimate));
      let estimate4 = estimate;
      // Investor2 swaps 1 token2
      transaction = await amm.connect(investor2).swapExactOutput(tokens(1));
      await transaction.wait();

      // check swap event was emitted
      await expect(transaction).to.emit(amm, 'Swap')
      .withArgs(
        investor2.address, 
        token2.address, 
        tokens(1), 
        token1.address, 
        estimate,
        await amm.token1Balance(), 
        await amm.token2Balance(), 
        (await ethers.provider.getBlock('latest')).timestamp
      );

      // Check investor2 balance after swap
      balance = await token1.balanceOf(investor2.address);
      console.log('Investor2 token1 balance after swap: ', formatEther(balance));
      expect(balance).to.equal(estimate4);

      // Check price after swap
      let priceAfter3 = await amm.token2Balance() / await amm.token1Balance();
      console.log('Price after swap: ', priceAfter3);

      // Check price after is greater than price before
      expect(priceAfter3).to.be.greaterThan(priceAfter2);

      // Check amm balances are in sync
      expect(await token1.balanceOf(amm.address)).to.eq(await amm.token1Balance());
      expect(await token2.balanceOf(amm.address)).to.eq(await amm.token2Balance());

    })

  })
  

})
