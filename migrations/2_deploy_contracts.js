const EEEE = artifacts.require("eeee");
const DolphinPod = artifacts.require("DolphinPod");

const eeeeToFarm = web3.utils.toBN('21000000000000000000000');

const eeeePerBlock = web3.utils.toBN('500000000000000000');
const durationBlocks = 42000;
const minElapsedBlocksBeforeStart = 2;
const startBlock = 14;


module.exports = async (deployer) => {
    await deployer.deploy(EEEE);
    eeeeInstance = await EEEE.deployed();
    //await deployer.deploy(DolphinPod, eeeeInstance.address, eeeePerBlock, durationBlocks, minElapsedBlocksBeforeStart, startBlock);
};

