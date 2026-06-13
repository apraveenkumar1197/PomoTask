import Base from "../api/Base";

export default class General {
    static dashiDetails() {
        return Base.get(`dashi/details`);
    }
}
