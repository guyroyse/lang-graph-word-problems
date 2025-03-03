import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'

import { tools } from './tools.js'
import { model } from './model.js'

// define the system prompt
const systemPrompt = new SystemMessage(`
  You are a tool calling AI assistant that solves mathematical word problems.
  You will be given simple word problems that do addition and subtraction,
  You will answer them using the tools available to you. Always use the tool
  to solve the problem. Never solve the problem yourself.`)

// invoke the model using the system prompt
async function invokeModel(state: typeof MessagesAnnotation.State) {
  const messages = [systemPrompt, ...state.messages]
  const response = await model.invoke(messages)
  return { messages: [response] }
}

// define the tools node
const toolsNode = new ToolNode(tools)

// decide where to go based on the last message
function routeToToolsOrEnd(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages.toReversed()[0] as AIMessage
  const areThereTools = lastMessage.tool_calls !== undefined && lastMessage.tool_calls.length > 0
  return areThereTools ? 'tools' : END
}

// create the graph and compile it
const graph = new StateGraph(MessagesAnnotation)
  .addNode('agent', invokeModel)
  .addNode('tools', toolsNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeToToolsOrEnd, ['tools', END])
  .addEdge('tools', 'agent')

const workflow = graph.compile()

// use what we just created
const prompt = new HumanMessage(`
  Alice has 5 apples and Bob has 3 oranges. Chuck takes 2 apples and eats
  them. Dave then finds 4 bananas and eats one. How many pieces of fruit do
  they have?`)

const history = await workflow.invoke({ messages: [prompt] })

logMessage(systemPrompt)
for (const message of history.messages) {
  logMessage(message)
}

function logMessage<T extends BaseMessage>(message: T) {
  const type = message.constructor.name
  console.log(`[${type}]`)

  if (message instanceof AIMessage && message.tool_calls && message.tool_calls.length > 0) {
    console.dir(message.tool_calls, { depth: null })
  } else {
    console.log(`${message.content}`)
  }

  console.log()
}
