
import config from './share.config';

import { wxshare } from './share';

export class WxShareWatcher {

    _$router;
    custData = {};
    constructor(router) {
        this._$router = router;
        this._$router.afterEach(this.afterEach.bind(this));
    }

    afterEach(to, from) {
        let shareConfig = {};
        let fullPath = to.fullPath.toLowerCase();
        let name = to.name.toLowerCase();
        if (!config.state.custShareList[name]) {
            shareConfig = {
                hideAllItem: true,
            }
            wxshare(shareConfig, fullPath);
        }
    }
}
