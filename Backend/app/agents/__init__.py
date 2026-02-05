import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import Agent, Runner
from agents.models.openai_chatcompletions import OpenAIChatCompletionsModel

load_dotenv()

# Z.ai client - use ZAI_API_KEY, not OPENAI_API_KEY
client = AsyncOpenAI(
    api_key=os.getenv("ZAI_API_KEY"),  # ← Make sure this is set in .env
    base_url="https://api.z.ai/api/paas/v4/"
)

# FIXED: Correct parameter names for your Agents SDK version
model = OpenAIChatCompletionsModel(
    openai_client=client,  # ← Not 'client'
    model="glm-4.7"   # ← Not 'model'
)

agent = Agent(
    name="ZaiAgent",
    instructions="You are a helpful assistant powered by Z.ai.",
    model=model
)

async def main():
    result = await Runner.run(agent, "Hello, what is Z.ai?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
