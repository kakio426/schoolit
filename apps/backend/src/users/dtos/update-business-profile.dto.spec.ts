import { validate } from 'class-validator';
import { UpdateBusinessProfileDto } from './update-business-profile.dto';

describe('UpdateBusinessProfileDto', () => {
    it('should validate a correct S2B number and registration number', async () => {
        const dto = new UpdateBusinessProfileDto();
        dto.companyName = 'Edupin Test';
        dto.registrationNum = '123-45-67890';
        dto.s2bNumber = '20240105-1234';
        dto.website = 'https://edupin.com';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if website is not a valid URL', async () => {
        const dto = new UpdateBusinessProfileDto();
        dto.website = 'invalid-url';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('website');
    });

    it('should accept optional s2bNumber', async () => {
        const dto = new UpdateBusinessProfileDto();
        dto.companyName = 'Edupin Test';
        // s2bNumber is omitted

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
