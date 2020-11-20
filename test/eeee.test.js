const { expectRevert, time } = require('@openzeppelin/test-helpers');
const dolphinsWTF = artifacts.require('eeee');

//const expectedSupply = web3.utils.toBN("42069000000000000000000");

contract('dolphinsWTF', ([alice, bob, carol, dan, ester, frank, gina]) => {
    beforeEach(async () => {
        this.eeee = await dolphinsWTF.new({ from: alice });
    });

    
    it('should have correct name, symbol, decimal and totalsupply', async () => {
        const name = await this.eeee.name();
        const symbol = await this.eeee.symbol();
        const decimals = await this.eeee.decimals();
        const totalSupply = await this.eeee.totalSupply();
        assert.equal(name.valueOf(), 'dolphins.wtf');
        assert.equal(symbol.valueOf(), 'EEEE');
        assert.equal(decimals.valueOf(), '18');
        assert.equal(totalSupply.valueOf().toString(), "42069000000000000000000");
    });


    it('should not allow owner or anyone else to mint token', async () => {
        await expectRevert(
            this.eeee.mint(alice, '100', { from: alice }),
            'ERC20Capped: cap exceeded',

        );
        await expectRevert(
            this.eeee.mint(carol, '1000', { from: bob }),
            "You're not the dev, get out of here",
        );
        const totalSupply = await this.eeee.totalSupply();
        assert.equal(totalSupply.valueOf().toString(), "42069000000000000000000");
    });

    it('should transfers properly with game off', async () => {
        // Starts with Game off
        await this.eeee.transfer(bob, '100', { from: alice });
        await this.eeee.transfer(carol, '1000', { from: alice });
        await this.eeee.transfer(carol, '10', { from: bob });
        const aliceBal = await this.eeee.balanceOf(alice);
        const bobBal = await this.eeee.balanceOf(bob);
        const carolBal = await this.eeee.balanceOf(carol);
        assert.equal(aliceBal.valueOf().toString(), '42068999999999999998900');
        assert.equal(bobBal.valueOf(), '90');
        assert.equal(carolBal.valueOf(), '1010');

    });

    it('should turn game on, and revert on immediate call to stop game', async () => {
        await this.eeee.startGame({ from: alice });
        const gameState = await this.eeee.readGameStatus();
        assert.equal(gameState.valueOf(), true);
        await expectRevert(
            this.eeee.endGame({ from: alice }),
            "Error: Revert or exceptional halt"
            );
    });

    it('should transfers properly with game on', async () => {
        await this.eeee.startGame({ from: alice });
        const gameState = await this.eeee.readGameStatus();
        assert.equal(gameState.valueOf(), true);

        const snatchBal = await this.eeee.checkSnatchBalance();
        assert.equal(snatchBal.valueOf().toString(), 950000000000000000);
        
        const transferAmount = web3.utils.toBN('1000000000000000000');

        await this.eeee.transfer(bob, transferAmount, { from: alice });

        const snatchBalAgain = await this.eeee.checkSnatchBalance();
        const aliceBal = await this.eeee.balanceOf(alice);
        const bobBal = await this.eeee.balanceOf(bob);

        assert.equal(aliceBal.valueOf().toString(), '42066990000000000000000');
        assert.equal(bobBal.valueOf().toString(), '1000000000000000000');
        assert.equal(snatchBalAgain.valueOf().toString(), 959500000000000000);

    });

    it('should fail if you try to do bad transfers', async () => {
        await this.eeee.transfer(carol, '1000', { from: alice});
        await expectRevert(
            this.eeee.transfer(bob, web3.utils.toBN('1010'), { from: carol }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.eeee.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });

    it('check dolphin levels', async () => {
        const MockERC20 = artifacts.require('MockERC20');
        const mockToken = await MockERC20.new('test', 'test', 1000, { from: alice });

        await this.eeee.setLP(mockToken.address,'1', {from: alice })
        
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(carol, web3.utils.toBN('69000000000000000001'), { from: alice });
        await this.eeee.transfer(dan, web3.utils.toBN('500000000000000000001'), { from: alice });
        await this.eeee.transfer(ester, web3.utils.toBN('2200000000000000000001'), { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });
        await mockToken.transfer(gina, '51', { from: alice });

        const aliceLvl = await this.eeee.dolphinhoodLevel({ from: alice });
        const bobLvl = await this.eeee.dolphinhoodLevel({ from: bob });
        const carolLvl = await this.eeee.dolphinhoodLevel({ from: carol });
        const danLvl = await this.eeee.dolphinhoodLevel({ from: dan });
        const esterLvl = await this.eeee.dolphinhoodLevel({ from: ester });
        const frankLvl = await this.eeee.dolphinhoodLevel({ from: frank });
        const ginaLvl = await this.eeee.dolphinhoodLevel({ from: gina });

        assert.equal(aliceLvl, "Peter");
        assert.equal(bobLvl, "notDolphin");
        assert.equal(carolLvl, "Orca");
        assert.equal(danLvl, "River");
        assert.equal(esterLvl, "Bottlenose");
        assert.equal(frankLvl, "Flipper");
        assert.equal(ginaLvl, "Orca");

    });

    it('check snatch, funding and privileges', async () => {
        const MockERC20 = artifacts.require('MockERC20');
        const mockToken = await MockERC20.new('test', 'test', 1000, { from: alice });

        await this.eeee.setLP(mockToken.address,'1', {from: alice })
        
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(carol, web3.utils.toBN('69000000000000000001'), { from: alice });
        await this.eeee.transfer(dan, web3.utils.toBN('500000000000000000001'), { from: alice });
        await this.eeee.transfer(ester, web3.utils.toBN('2200000000000000000001'), { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });
        await mockToken.transfer(gina, '51', { from: alice });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await this.eeee.snatchFood({ from: alice });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await expectRevert( 
            this.eeee.snatchFood({ from: bob }),
            "Eeee! You're not even an orca",
        );
        await this.eeee.snatchFood({ from: carol });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await this.eeee.snatchFood({ from: dan });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await this.eeee.snatchFood({ from: ester });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await this.eeee.snatchFood({ from: frank });

        await this.eeee.fundSnatch(web3.utils.toBN('500000000000000001'), { from: alice });
        await this.eeee.snatchFood({ from: gina });
    });

    it('check that dev feeding can be activated and only called by the dev', async () => {
        
        // Check Dev cannot call before, then activate, check Dev can eat, and no one else can

        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        await expectRevert (
            this.eeee.feedDev({ from: alice }),
            "sorry dev, no scraps for you",
        );

        await this.eeee.allowDevToEat({ from: frank });

        await this.eeee.feedDev({ from: alice });

        await expectRevert (
            this.eeee.feedDev({ from: bob }),
            "You're not the dev, get out of here",
        );

    });

    it('check that the snatch rates can be changed', async () => {
        
        // Check Dev cannot call before, then activate, check Dev can eat, and no one else can

        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(carol, web3.utils.toBN('69000000000000000001'), { from: alice });
        await this.eeee.transfer(dan, web3.utils.toBN('500000000000000000001'), { from: alice });
        await this.eeee.transfer(ester, web3.utils.toBN('2200000000000000000001'), { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        await expectRevert (
            this.eeee.changeSnatchRate(2, { from: carol }),
            "You're not even a bottlenose dolphin",
        );

        await expectRevert (
            this.eeee.changeSnatchRate(4, { from: ester }),
            "Eeee! Minimum snatchRate is 1%, maximum is 3%. Flipper can use the changeSnatchRateHigh function.",
        );

        await expectRevert (
            this.eeee.changeSnatchRate(0, { from: ester }),
            "Eeee! Minimum snatchRate is 1%, maximum is 3%. Flipper can use the changeSnatchRateHigh function.",
        );

        await expectRevert (
            this.eeee.changeSnatchRate(0.5, { from: ester }),
            'underflow',
        );

        await this.eeee.changeSnatchRate(2, { from: ester });

    });

    it('check that the higher snatch rates can be changed', async () => {
        
        // Check Dev cannot call before, then activate, check Dev can eat, and no one else can

        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(carol, web3.utils.toBN('69000000000000000001'), { from: alice });
        await this.eeee.transfer(dan, web3.utils.toBN('500000000000000000001'), { from: alice });
        await this.eeee.transfer(ester, web3.utils.toBN('2200000000000000000001'), { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        await expectRevert (
            this.eeee.changeSnatchRateHigh(2, { from: ester }),
            "You're not flipper",
        );

        await expectRevert (
            this.eeee.changeSnatchRateHigh(11, { from: frank }),
            "Eeee! Minimum snatchRate is 1%, maximum 10% for Flipper",
        );

        await expectRevert (
            this.eeee.changeSnatchRateHigh(0, { from: frank }),
            "Eeee! Minimum snatchRate is 1%, maximum 10% for Flipper",
        );

        await expectRevert (
            this.eeee.changeSnatchRateHigh(0.5, { from: frank }),
            'underflow',
        );

        await this.eeee.changeSnatchRateHigh(9, { from: frank });

    });

    it('only Flipper can change the cooldown rates', async () => {

        // this test requires commenting out the requirement for the game to be started.
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        await expectRevert (
            this.eeee.updateCoolDown(2, { from: bob }),
            "You're not flipper",
        );

        await expectRevert (
            this.eeee.updateCoolDown(27, { from: frank }),
            "Eeee! Minimum cooldown is 1 hour, maximum is 24 hours",
        );

        await expectRevert (
            this.eeee.updateCoolDown(0, { from: frank }),
            "Eeee! Minimum cooldown is 1 hour, maximum is 24 hours",
        );

        await expectRevert (
            this.eeee.updateCoolDown(0.5, { from: frank }),
            'underflow',
        );

        await this.eeee.updateCoolDown(9, { from: frank });

    });

    it('only Flipper can change the Orca threshold levels', async () => {

        // this test requires commenting out the requirement for the game to be started.
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        const checkSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(checkSnatched.valueOf().toString(), '0');

        await expectRevert (
            this.eeee.updateOrca(web3.utils.toBN('5000000000000000000000'), { from: bob }),
            "You're not flipper",
        );

        await expectRevert (
            this.eeee.updateOrca(web3.utils.toBN('50000000000000000'), { from: frank }),
            "Threshold for Orcas must be 1 to 99 EEEE",
        );

        await this.eeee.updateOrca(web3.utils.toBN('68000000000000000000'), { from: frank });

        const reCheckSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(reCheckSnatched.valueOf().toString(), '950000000000000000');

    });

    it('only Flipper can change the River threshold levels', async () => {

        // this test requires commenting out the requirement for the game to be started.
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        const checkSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(checkSnatched.valueOf().toString(), '0');

        await expectRevert (
            this.eeee.updateRiver(web3.utils.toBN('5000000000000000000000'), { from: bob }),
            "You're not flipper",
        );

        await expectRevert (
            this.eeee.updateRiver(web3.utils.toBN('2207000000000000000000'), { from: frank }),
            "Maximum threshold for River Dolphins is 2103.45 EEEE",
        );

        await this.eeee.updateRiver(web3.utils.toBN('420690000000000100000'), { from: frank });

        const reCheckSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(reCheckSnatched.valueOf().toString(), '95000');

    });

    it('only Flipper can change the Bottlenose threshold levels', async () => {

        // this test requires commenting out the requirement for the game to be started.
        await this.eeee.transfer(bob, "1000", { from: alice });
        await this.eeee.transfer(frank, web3.utils.toBN('4400000000000000000001'), { from: alice });

        const checkSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(checkSnatched.valueOf().toString(), '0');

        await expectRevert (
            this.eeee.updateBottlenose(web3.utils.toBN('5000000000000000000000'), { from: bob }),
            "You're not flipper",
        );

        await expectRevert (
            this.eeee.updateBottlenose(web3.utils.toBN('4207000000000000000000'), { from: frank }),
            "Maximum threshold for River Dolphins is 4206.9 EEEE",
        );

        await this.eeee.updateBottlenose(web3.utils.toBN('420690000000000100000'), { from: frank });

        const reCheckSnatched = await this.eeee.checkSnatchBalance();

        assert.equal(reCheckSnatched.valueOf().toString(), '1598621999999999905000');

    });

    it('only Peter can activate anarchy', async () => {

        await this.eeee.transfer(bob, "1000", { from: alice });

        await this.eeee.fundDev(web3.utils.toBN('7000000000000000000'), { from: alice });

        const checkSnatched = await this.eeee.checkSnatchBalance();
        assert.equal(checkSnatched.valueOf().toString(), '0');
        const checkDevFund = await this.eeee.checkDevBalance();
        assert.equal(checkDevFund.valueOf().toString(), '7000000000000000000');

        await this.eeee.startGame({ from: alice });
        await time.increase('3601');

        await expectRevert (
            this.eeee.activateAnarchy({ from: bob }),
            "You're not peter the dolphin",
        );

        await this.eeee.activateAnarchy({ from: alice });

        const reCheckDevFund = await this.eeee.checkDevBalance();
        assert.equal(reCheckDevFund.valueOf().toString(), '0');

        await expectRevert (
            this.eeee.feedDev({ from: alice }),
            "You're not the dev, get out of here",
        );
    });
  });
