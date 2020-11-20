const EEEE = artifacts.require("eeee");
const EEEENotFarmed = artifacts.require("eeee");
const DolphinPod1 = artifacts.require("DolphinPod");
const DolphinPod2 = artifacts.require("DolphinPod");
const snatchFeeder = artifacts.require("snatchFeeder");


const eeeeToFarm1 = web3.utils.toBN('21000000000000000000000');
const eeeePerBlock1 = web3.utils.toBN('500000000000000000');
const durationBlocks1 = web3.utils.toBN('42');
const minElapsedBlocksBeforeStart1 = web3.utils.toBN('2');


const eeeeToFarm2 = web3.utils.toBN('6969000000000000000000');
const eeeePerBlock2 = web3.utils.toBN('500000000000000000');
const durationBlocks2 = web3.utils.toBN('84');
const minElapsedBlocksBeforeStart2 = web3.utils.toBN('2');


const eeeeToSnatch = web3.utils.toBN('14100000000000000000000');

module.exports = async (deployer) => {
    await deployer.deploy(EEEENotFarmed);
    
    await deployer.deploy(EEEE);
    eeeeInstance = await EEEE.deployed();

    const startBlock1 = await web3.eth.getBlockNumber() + 10;
    const offsetStart2 = (startBlock1 + durationBlocks1 + 10);
    const startBlock2 = offsetStart2;

    await deployer.deploy(DolphinPod1, eeeeInstance.address, eeeePerBlock1, durationBlocks1, minElapsedBlocksBeforeStart1, startBlock1);
    pod1 = await DolphinPod1.deployed();
    eeeeInstance.transfer(pod1.address, eeeeToFarm1);
    
    await deployer.deploy(DolphinPod2, eeeeInstance.address, eeeePerBlock2, durationBlocks2, minElapsedBlocksBeforeStart2, startBlock2);
    pod2 = await DolphinPod2.deployed();
    eeeeInstance.transfer(pod1.address, eeeeToFarm2);

    await deployer.deploy(snatchFeeder, eeeeInstance.address);
    snatchInstance = await snatchFeeder.deployed();
    eeeeInstance.transfer(snatchInstance.address, eeeeToSnatch);
};

