// 404 Not Found Page
import { Component } from 'vue-property-decorator';
import BaseVue from 'base.vue';

// import share from '../../../commons/env/share/shareTest';



import './notfound.scss';
@Component({
    template: require('./notfound.html')
})
export class NotFound extends BaseVue {


    mounted() {
        // console.log(share);
        this.$nextTick(() => {

        });
    }

    toHome() {
        this.$router.push('/');
    }
    // call(command){
    //     share.call(command);
    // }
}
