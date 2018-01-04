
import Config from './share.config';

import { wxshare } from './share';

export class WxShareWatcher {

    _$router;
    custData = {};
    constructor(router) {
        this._$router = router;
        this._$router.afterEach(this.afterEach.bind(this));
    }

    afterEach(to, from) {
        let _config = Config();
        let shareConfig = {};
        let fullPath = to.fullPath.toLowerCase();
        let name = to.name.toLowerCase();
        if (_config.state.hideAllList[name]) {
            shareConfig = {
                hideAllItem: true,
            }
        }else if(_config.state.shareConfig[name]){
            shareConfig = _config.state.shareConfig[name]
        }else {
            shareConfig = _config.state.shareConfig[fullPath];
        }
        wxshare(shareConfig, fullPath);
    }
}
