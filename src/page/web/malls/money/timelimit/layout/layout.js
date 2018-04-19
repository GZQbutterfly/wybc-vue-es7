import { Component, Vue } from 'vue-property-decorator';

import layoutStore from './layout.store';

// ==>
import './layout.scss';
@Component({
    template: require('./layout.html')
})
export class Layout extends Vue {

    timelimitToast = { show: false, title: '', content: '' };

    data() {
        return {

        };
    }

    created() {
        this.$store.registerModule(['timelimt_store'], layoutStore);

        this.timelimitToast = this.$store.state.timelimt_store.toast;
    }

    mounted() {


        this.$nextTick(() => {

        });
    }

    destroyed() {
        this.$store.unregisterModule(['timelimt_store']);
    }


    updated() {

    }
}
