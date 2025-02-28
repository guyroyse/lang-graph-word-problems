import { ChatOpenAI } from '@langchain/openai'

import { tools } from './tools.js'

const model = new ChatOpenAI({ model: 'gpt-4o' })
const modelWithTools = model.bindTools(tools)

export { modelWithTools as model }
