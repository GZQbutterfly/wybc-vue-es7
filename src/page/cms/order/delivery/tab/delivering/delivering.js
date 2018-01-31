// 配送中tab

import { Component, Vue } from 'vue-property-decorator';

import { Card } from '../../card/card';

import './delivering.scss';
@Component({
    template: require('./delivering.html'),
    components: {
        'card-box': Card
    }
})
export class Delivering extends Vue {

    list = [1, 3];
    mounted() {

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
            _self.list.push(5, 6, 7, 8, 9);
            done(true);
        }, 500);
    }

    // 联系买家
    callUser(item) {
        console.log('联系买家', item)
    }
    // 确认到达
    confirmArrive(item) {
        console.log('确认到达', item)
    }
}