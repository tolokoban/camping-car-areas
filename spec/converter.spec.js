var Converter = require("converter");

describe('Converter', function() {
    it('should convert positive values', function() {
        expect(Converter.toHexagesimal(3.14)).toBe("3°8'24''");
        expect(Converter.toHexagesimal(37.87103)).toBe("37°52'15''");
    });
    it('should convert negative values', function() {
        expect(Converter.toHexagesimal(-4.8547)).toBe("-4°51'17''");
        expect(Converter.toHexagesimal(-37.87103)).toBe("-37°52'16''");
    });
});
