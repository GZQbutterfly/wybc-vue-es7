// 抢单 tab

import { Component, Vue, Prop } from 'vue-property-decorator';

import { Card } from '../../card/card';
import Swiper from 'swiper';

//import { Unauthorized } from '../../unauthorized/unauthorized';

import './rob.scss';
@Component({
    template: require('./rob.html'),
    components: {
        'card-box': Card,
        //'unauthorized': Unauthorized
    }
})
export class RobOrder extends Vue {
    @Prop({ type: Function, default: () => { } })
    operation;


    list = [];

    authShow = false;
    authFirst = false;

    mounted() {
        this.$nextTick(() => {
            this.initPage();
        });
    }

    initPage() {
        // this.alertAuth();
    }

    refresh(done) {
        let _self = this;
        setTimeout(() => {
            _self.list = [3, 4, 5, 6];
            done(true);
        }, 500);
    }

    infinite(done) {
        let _self = this;
        setTimeout(() => {
            if (_self.list.length < 10) {
                _self.list.push(5, 6, 7, 8, 9);
                done(false);
            } else {
                done(true);
            }
        }, 300);
    }

    alertAuth() {
        this.authFirst = true;
        this.authShow = !this.authShow;
    }

    receiveOrder(item) {
        let success = Math.floor(Math.random()*2);
        let data = {
            auth: false,
            order: {
                success: !success
            }
        };
        this.operation(data);
        console.log('接单', item);
    }

}