export default class UMConvert {
    id; // int
    desdeUMId; // int
    hastaUMId; // int
    factor; // decimal

    constructor (row) {
        this.id = row.id;
        this.desdeUMId = row.desdeUMId;
        this.hastaUMId = row.hastaUMId;
        this.factor = row.factor;
    }

    toJson () {
        return {
            id: this.id,
            desdeUMId: this.desdeUMId,
            hastaUMId: this.hastaUMId,
            factor: this.factor
        };
    }
}
