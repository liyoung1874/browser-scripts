import { createApp } from 'vue'
import App from './app.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

const appContainer = () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    return app
}

app.use(ElementPlus).mount(appContainer())
