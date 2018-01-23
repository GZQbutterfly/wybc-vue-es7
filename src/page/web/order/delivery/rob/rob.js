import { Component, Vue } from 'vue-property-decorator';

import { Card } from '../card/card';
import Swiper from 'swiper';



import './rob.scss';
@Component({
    template: require('./rob.html'),
    components: {
        'card-box': Card
    }
})
export class RobOrder extends Vue {
    list = [];

    mounted() {
        this.$nextTick(() => {
   
        });
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

}