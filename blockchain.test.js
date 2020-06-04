const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain, newchain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newchain = new Blockchain();
        originalChain = blockchain.chain;
    });

    it('contains a chain of Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to chain', () => {
        const newData = 'foo_bar';
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data: 'Bears'});
                blockchain.addBlock({data: 'Beets'});
                blockchain.addBlock({data: 'Bars'});
            });
            
            describe('and a lasthash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'bad data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });                    
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns false', () => {

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });  
            });
        });
    });

    describe('repalceChain()', () => {
        describe('when the chain is not longer', () => {
            it('does not replace the chain', () => {
                newchain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newchain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('when the chain is longer', () => {
            beforeEach(() => {
                newchain.addBlock({data: 'Bears'});
                newchain.addBlock({data: 'Beets'});
                newchain.addBlock({data: 'Bars'});
            });
            describe('and the chain is invalid', () => {
                it('does not replace the chain', () => {
                    newchain.chain[2].hash = 'fake-hash';
                    blockchain.replaceChain(newchain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });

            describe('and the chain is valid', () => {
                it('replaces the chain', () => {
                    blockchain.replaceChain(newchain.chain);
                    expect(blockchain.chain).toEqual(newchain.chain);
                });
            });
        });
    });
});