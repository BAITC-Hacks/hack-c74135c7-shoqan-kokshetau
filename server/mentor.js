import {fail,keys,string} from './domain.js';
import {openAIFetch} from './limits.js';

export function mentorInput(body){
  keys(body,['messages','language']);
  if(!['kk','ru'].includes(body.language))fail(400,'Unsupported language');
  if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>21)fail(400,'Invalid conversation');
  const messages=body.messages.map((message,index)=>{
    keys(message,['role','content']);
    if(message.role!==(index%2===0?'user':'assistant'))fail(400,'Invalid message order');
    return {role:message.role,content:string(message.content,message.role==='user'?4000:8000)};
  });
  if(messages.at(-1).role!=='user'||messages.reduce((n,m)=>n+m.content.length,0)>30000)fail(400,'Conversation too long');
  return {messages,language:body.language};
}
export async function mentorReply(body,{apiKey=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL||'gpt-4o-mini',fetcher=openAIFetch}={}){
  const {messages,language}=mentorInput(body);
  if(!apiKey)fail(503,'Mentor not configured');
  let response;
  try{
    response=await fetcher('https://api.openai.com/v1/responses',{
      method:'POST',signal:AbortSignal.timeout(25000),headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,store:false,max_output_tokens:1800,
        instructions:`You are Shoqan's AI mentor for a beginner building business and student projects. Respond in ${language==='kk'?'Kazakh':'Russian'}, unless the user requests another language. Be concise, patient and specific. Avoid flattery and generic praise. Follow the actual business domain: for warehouse inventory, discuss products and stock quantities, not student names or project statuses. Do not introduce unnecessary personal data. Explain one practical next step, use examples, and ask a focused question when needed. Help with learning, coding, task definition, feasibility and project planning. Do not invent project facts or claim to have completed actions. You have no database, files, browser, live web access or tools; you cannot publish tasks, select teams or change scores. Only conversation messages are provided. Never ask for passwords or API keys. Distinguish suggestions from verified facts. Shoqan scores confirmed context20,data20,result15,success15,constraints10,users10,contact10; low scores do not block proposals. Business selects teams manually. Use plain text without Markdown emphasis markers, readable short paragraphs and lists.`,
        input:messages})
    });
    if(!response.ok)fail(response.status===429?429:502,'Mentor unavailable');
    const result=await response.json();
    const content=(result.output||[]).flatMap(item=>item.content||[]);
    const reply=content.filter(item=>item.type==='output_text').map(item=>item.text).join('\n').trim();
    if(result.status!=='completed'||!reply||reply.length>8000)fail(502,'Invalid mentor response');
    return {reply,source:'openai'};
  }catch(error){
    if(error.status)throw error;
    fail(error.code==='AI_LIMIT'?429:error.name==='TimeoutError'?504:502,'Mentor unavailable');
  }
}
