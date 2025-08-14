export class CreateAddressDto {
    addressLineOne: string;
    addressLineTwo?: string;
    postalCode: string;
    city: string;
    state: string;
    typeId: number;
    userId: number;
    isDefault: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
