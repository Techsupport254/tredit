// Mock Pinata utility for testing
const pinata = {
	pinFileToIPFS: async (file) => {
		return {
			IpfsHash: "QmTest123",
			PinSize: 1234,
			Timestamp: new Date().toISOString(),
		};
	},

	pinJSONToIPFS: async (json) => {
		return {
			IpfsHash: "QmTest456",
			PinSize: 567,
			Timestamp: new Date().toISOString(),
		};
	},
};

module.exports = pinata;
