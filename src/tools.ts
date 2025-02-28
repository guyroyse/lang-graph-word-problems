import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const additionTool = tool(
  args => {
    return args.numbers.reduce((a, b) => a + b)
  },
  {
    name: 'AddArrayOfNumbers',
    description: 'Accepts an array of numbers and adds them together',
    schema: z.object({
      numbers: z.array(z.number()).describe('The numbers to add together')
    })
  }
)

const subtractionTool = tool(
  args => {
    return args.a - args.b
  },
  {
    name: 'SubtractTwoNumbers',
    description: 'Subtracts the second number from the first',
    schema: z.object({
      a: z.number().describe('The number to subtract from'),
      b: z.number().describe('The number to subtract')
    })
  }
)

const tools = [additionTool, subtractionTool]

export { additionTool, subtractionTool, tools }
