import { Component, Vue } from 'vue-property-decorator';

import { isWeiXin, interval, getAuthUser, isNotLogin, toLogin } from 'common.env';
import { debounce } from 'lodash';


// ==>
import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class Layout extends Vue {
    
    data() {
        return {

        };
    }

    mounted() {
        this.$nextTick(() => {

        });
    }


    updated() {

    }
}
