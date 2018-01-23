import { Component } from 'vue-property-decorator';
import  BaseVue  from 'base.vue';
import { get } from 'lodash';

import { getZoneData } from 'common.env';
//import { Address } from '../address/address';

import service from './user.address.service';
import './user.address.scss';

@Component({
    template: require('./user.address.html'),
    components: {
        //'address-operation': Address
    }
})
export class UserAddress extends BaseVue {
    addressList = [];
    _$service;
    mounted() {
        this._$service = service(this.$store);

        this.$nextTick(() => {
            document.title = '我的地址';
            this.queryAddressList();
        });
    }
    queryAddressList() {
        this._$service.queryAddressList().then(async (res) => {
            let _result = res.data;
            if (_result.errorCode) {
                return;
            }
            let _addressList = get(_result, 'data');
            _addressList.sort((a, b) => b.isDefault - a.isDefault);
            if (_addressList && _addressList.length) {
                for (let i = 0, len = _addressList.length; i < len; i++) {
                    let _address = _addressList[i];
                    if(_address.campus){
                        _address.addressInfo = {
                            campus: _address.campus,
                            dormitory: _address.dormitory
                        }
                    }else{
                        _address.addressInfo = await getZoneData(_address);
                    }
                }
            }
            this.addressList = _addressList
        });
    }
    toCreate() {
        this.$router.push({ path: 'address', query: { type: 'create' } });
    }
    toUpdate(item) {
        this.$router.push({ path: 'address', query: { type: 'update', item } });
    }
}
