import { Component, Vue } from 'vue-property-decorator';

import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class OrderLayout extends Vue {
    
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
