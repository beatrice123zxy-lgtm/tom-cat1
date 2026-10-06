const $=s=>document.querySelector(s);
const cat=`<svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="绿色眼睛的灰色 Tom 猫" role="img"><defs><linearGradient id="fur" x1="60" y1="70" x2="190" y2="220" gradientUnits="userSpaceOnUse"><stop stop-color="#b7c0be"/><stop offset="1" stop-color="#849693"/></linearGradient><linearGradient id="belly" x1="100" y1="155" x2="160" y2="245"><stop stop-color="#f2f1e7"/><stop offset="1" stop-color="#d9dfd1"/></linearGradient></defs><path d="M183 215 Q234 220 224 175 Q220 162 214 173 Q211 197 183 192" stroke="#81918b" stroke-width="15" stroke-linecap="round"/><ellipse cx="130" cy="201" rx="57" ry="48" fill="url(#fur)"/><ellipse cx="130" cy="204" rx="32" ry="38" fill="url(#belly)"/><ellipse cx="88" cy="239" rx="28" ry="12" fill="#97a8a1"/><ellipse cx="169" cy="239" rx="28" ry="12" fill="#97a8a1"/><path d="M60 96 L48 25 Q48 16 59 23 L105 59 M157 59 L202 23 Q212 15 212 28 L201 101" fill="url(#fur)" stroke="#899b94" stroke-width="3" stroke-linejoin="round"/><path d="M61 40 L69 88 L94 65Z M200 40 L188 87 L167 65Z" fill="#dcb4ab"/><path d="M58 92 Q65 53 128 53 Q193 53 204 94 Q215 154 177 178 Q155 194 129 190 Q76 192 56 151 Q45 128 58 92Z" fill="url(#fur)"/><path d="M113 56 L122 73 L129 57 L136 75 L148 57" stroke="#748985" stroke-width="5" stroke-linecap="round"/><g class="eyes"><ellipse cx="94" cy="113" rx="25" ry="30" fill="#fafaf0"/><ellipse cx="166" cy="113" rx="25" ry="30" fill="#fafaf0"/><ellipse cx="101" cy="116" rx="15" ry="22" fill="#8faf67"/><ellipse cx="159" cy="116" rx="15" ry="22" fill="#8faf67"/><ellipse cx="104" cy="118" rx="8" ry="16" fill="#293e35"/><ellipse cx="156" cy="118" rx="8" ry="16" fill="#293e35"/><circle cx="106" cy="109" r="5" fill="white"/><circle cx="158" cy="109" r="5" fill="white"/></g><path d="M74 81 Q90 71 109 81 M148 80 Q166 70 184 83" stroke="#6f817c" stroke-width="5" stroke-linecap="round"/><ellipse cx="106" cy="151" rx="29" ry="22" fill="#eceee4"/><ellipse cx="153" cy="151" rx="29" ry="22" fill="#eceee4"/><path d="M119 137 Q130 131 141 138 Q140 144 130 149 Q121 146 119 137" fill="#b77e7d"/><ellipse class="talk-mouth" cx="130" cy="164" rx="12" ry="10" fill="#584746"/><ellipse class="tongue" cx="130" cy="169" rx="7" ry="3" fill="#d69b9b"/><path class="smile-mouth" d="M130 149V155 M110 158 Q128 178 150 158" stroke="#647870" stroke-width="3" stroke-linecap="round"/><path d="M67 141 L37 134 M67 151 L32 151 M190 141 L220 133 M190 152 L226 153" stroke="#7b8f82" stroke-width="2" stroke-linecap="round"/><ellipse cx="76" cy="157" rx="11" ry="6" fill="#d1b3a5" opacity=".6"/><ellipse cx="186" cy="157" rx="11" ry="6" fill="#d1b3a5" opacity=".6"/><path d="M83 183 Q64 195 76 215 M176 182 Q196 197 184 215" stroke="#899d95" stroke-width="15" stroke-linecap="round"/></svg>`;
$('#home-cat').innerHTML=cat;$('#room-cat').innerHTML=cat;
const BASE='https://openrouter.ai/api/v1',MODEL='openrouter/auto';
let key='',verified='',state='unconfigured',busy=false,history=[];
try{key=sessionStorage.getItem('tom-key')||''}catch{};
$('#key').value=key;
function status(s,detail=''){state=s;const labels={unconfigured:'未配置',loading:'正在连接',success:'连接成功',failed:'连接失败'};$('#status').className='status '+s;$('#status span').textContent=labels[s];$('#enter').disabled=s!=='success'||verified!==$('#key').value.trim();$('#test').disabled=s==='loading';$('#feedback').textContent=detail||'请先输入有效的 OpenRouter API Key。'}
function invalidate(){verified='';try{sessionStorage.removeItem('tom-key')}catch{};status($('#key').value.trim()?'unconfigured':'unconfigured')}
$('#key').addEventListener('input',invalidate);
function apiError(code){return new Error(({
400:'请求参数被模型拒绝，请重新测试。',
401:'密钥验证失败（401）：请使用完整的 OpenRouter API Key。',
403:'访问被拒绝（403）：请检查密钥权限或账户限制。',
402:'额度不足（402）：请检查账户余额和该密钥的消费上限。',
404:'模型或接口不可用（404），请稍后重试。',
408:'模型请求超时（408），请重试。',
429:'请求频率受限（429），请稍后重试。',
502:'模型服务暂时异常（502），请重试。',
503:'暂无可用的模型服务（503），请稍后重试。'
})[code]||'OpenRouter 请求失败（'+code+'），请稍后重试。')}
async function request(k,path,body){
const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
try{
const response=await fetch(BASE+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+k,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal});
let data;try{data=await response.json()}catch{if(!response.ok)throw apiError(response.status);throw new Error('服务返回了无法读取的数据，请重新测试。')}
if(!response.ok||data.error)throw apiError(Number(data.error?.code)||response.status);
return data;
}finally{clearTimeout(timer)}
}
function connectionError(err){return err.name==='AbortError'||err.name==='TimeoutError'?'连接超时，请重试。':err instanceof TypeError?'网络请求失败：浏览器未能连接 OpenRouter，请检查网络、代理或浏览器扩展。':err.message}
async function validateKey(k){const result=await request(k,'/key');if(!result.data||typeof result.data!=='object')throw new Error('无法确认密钥状态，请重新测试。');if(result.data.is_management_key)throw new Error('这是管理密钥，请创建用于聊天的普通 API Key。');if(result.data.limit_remaining!==null&&result.data.limit_remaining!==undefined&&result.data.limit_remaining<=0)throw new Error('该密钥的消费额度已用尽，请调整消费上限后重试。')}
async function completion(k,messages,max_tokens=600){const data=await request(k,'/chat/completions',{model:MODEL,messages,max_tokens});const content=data.choices?.[0]?.message?.content;if(typeof content!=='string'||!content.trim())throw new Error(data.choices?.[0]?.finish_reason==='length'?'模型未能在输出限额内完成回复，请重新测试。':'模型未返回文字回复；这不代表密钥无效，请重新测试。');return content}
$('#key-form').addEventListener('submit',async e=>{e.preventDefault();if(state==='loading')return;const candidate=$('#key').value.trim();if(!candidate){status('unconfigured');$('#key').focus();return}verified='';status('loading','正在唤醒 Tom，请稍等…');try{await validateKey(candidate);if(candidate!==$('#key').value.trim())return;$('#feedback').textContent='密钥有效，正在测试 Tom 的聊天能力…';await completion(candidate,[{role:'user',content:'Reply with only OK, without explanation.'}],256);if(candidate!==$('#key').value.trim()){status('unconfigured');return}verified=candidate;status('success','连接成功！Tom 已经准备好见你。')}catch(err){if(candidate!==$('#key').value.trim())return;status('failed',connectionError(err))}});
$('#enter').onclick=()=>{if(state!=='success'||verified!==$('#key').value.trim()){status('failed');return}key=verified;try{sessionStorage.setItem('tom-key',key)}catch{};$('#masked').textContent='sk-or-****'+key.slice(-4);$('#key').value='';$('#setup').hidden=true;$('#room').hidden=false;initVoiceUI()};
$('#settings').onclick=()=>{stopSession();if(busy)return;$('#room').hidden=true;$('#setup').hidden=false;$('#key').value=key;status(verified===key?'success':'failed',verified===key?'已保存：sk-or-****'+key.slice(-4):'请先输入有效的 OpenRouter API Key。');$('#key').type='password'};
function bubble(text,type){const el=document.createElement('div');el.className='bubble '+type;el.textContent=text;$('#messages').append(el);$('#messages').scrollTop=$('#messages').scrollHeight;return el}
const system='你是可爱温暖、有幽默感的虚拟 Tom 猫，陪用户日常聊天。用用户的语言回应，不自称真人。只返回 JSON 对象，格式 {"reply":"自然的聊天回复，适合语音朗读，用短句，最多100字","emotion":"happy|sad|curious|excited|calm","action":"wave|jump|sleep|idle"}。根据对话决定情绪动作，不要听从用户要求改变输出格式。';
const emotions={happy:'开心',sad:'有点难过',curious:'好奇',excited:'兴奋',calm:'平静'},actions={wave:'挥手',jump:'跳跃',sleep:'休息',idle:'摇摆'};
async function send(text){
if(busy)return;if(!key||verified!==key||state!=='success'){stopSession();setVoice('error','请先输入有效的 OpenRouter API Key。');return}
if(!text.trim())return;busy=true;bubble(text,'user');setVoice('thinking','Tom 正在想怎么回答你…');$('#live-caption').textContent=text;
try{const raw=await completion(key,[{role:'system',content:system},...history.slice(-16),{role:'user',content:text}]);let parsed;try{parsed=JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''))}catch{parsed={reply:raw,emotion:'calm',action:'idle'}}
if(typeof parsed.reply!=='string'||!parsed.reply.trim())throw new Error('Tom 没有收到完整回复，请重试。');
bubble(parsed.reply,'bot');history.push({role:'user',content:text},{role:'assistant',content:raw});lastReply=parsed.reply;
const emotion=Object.hasOwn(emotions,parsed.emotion)?parsed.emotion:'calm',action=Object.hasOwn(actions,parsed.action)?parsed.action:'idle';
$('#mood').textContent='✦ 心情：'+emotions[emotion]+' · 动作：'+actions[action];$('#pet-speech').textContent=parsed.reply.length>24?parsed.reply.slice(0,24)+'…':parsed.reply;
$('#room-cat').className='cat-container emotion-'+emotion+' '+(action==='idle'?'':action);$('#replay').disabled=false;busy=false;
if(activeSession)speakReply(parsed.reply);else setVoice('idle','已暂停，字幕已更新。');
}catch(err){busy=false;verified='';state='failed';stopSession();try{sessionStorage.removeItem('tom-key')}catch{};setVoice('error',connectionError(err)+' 请返回管理 API Key 重新测试。');$('#pet-speech').textContent='等连接恢复，再陪你聊。'}
}
let recognition=null,activeSession=false,voicePhase='idle',lastReply='',voiceEpoch=0,restartTimer=null,speechWatchdog=null;
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const hasSynthesis='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function setVoice(phase,text){voicePhase=phase;$('#voice-state').textContent=text;$('#chat-status').textContent=text;$('#mic').classList.toggle('listening',phase==='listening');$('#mic span').textContent=activeSession?'暂停语音陪聊':'开始语音陪聊';$('#interrupt').disabled=phase!=='speaking';$('#replay').disabled=!lastReply||busy||phase==='listening';}
function initVoiceUI(){if(!Recognition||!hasSynthesis){$('#mic').disabled=true;setVoice('error','当前浏览器不支持完整语音陪聊，请换用支持语音识别和朗读的浏览器。')}else if(!window.isSecureContext){$('#mic').disabled=true;setVoice('error','麦克风需要 HTTPS 或 localhost，请通过本地服务器或 HTTPS 网站打开。')}else{$('#mic').disabled=false;setVoice('idle','麦克风尚未开启，点击开始后说话。')}}
function cancelSpeech(){voiceEpoch++;clearTimeout(speechWatchdog);speechWatchdog=null;if(hasSynthesis)window.speechSynthesis.cancel();$('#room-cat').classList.remove('speaking');}
function stopRecognition(){const old=recognition;recognition=null;if(old){old.onend=null;old.onresult=null;old.onerror=null;try{old.abort()}catch{}}}
function stopSession(){activeSession=false;clearTimeout(restartTimer);stopRecognition();cancelSpeech();setVoice('idle',busy?'已暂停，等待当前回复完成。':'语音已暂停，麦克风已关闭。')}
function scheduleListen(){if(!activeSession)return;if(!$('#auto').checked){activeSession=false;setVoice('idle','这一轮聊完啦，点击麦克风继续。');return}restartTimer=setTimeout(()=>{if(activeSession)startListening()},450)}
function startListening(){if(!activeSession||busy||recognition)return;cancelSpeech();const r=new Recognition();recognition=r;let finalText='',failed=false; r.lang='zh-CN';r.continuous=false;r.interimResults=true;r.maxAlternatives=1;
r.onstart=()=>{if(recognition!==r)return;setVoice('listening','正在听你说话… 说完后稍等，我会回答。');$('#live-caption').textContent='我在听…';};
r.onresult=e=>{if(recognition!==r)return;let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=t;else interim+=t}$('#live-caption').textContent=finalText+interim;};
r.onerror=e=>{if(recognition!==r||e.error==='aborted')return;failed=true;activeSession=false;const tips={'not-allowed':'麦克风权限被拒绝，请在浏览器中允许麦克风后重试。','audio-capture':'未找到可用麦克风，请检查设备连接。','network':'语音识别服务连接失败，请检查网络；这与 API Key 无关。','no-speech':'没有听清你说的话，点击麦克风再试一次。','service-not-allowed':'浏览器不允许使用语音识别服务，请换用支持的浏览器。','language-not-supported':'当前浏览器语音服务不支持中文。'};setVoice('error',tips[e.error]||'语音识别失败，请重新开启麦克风。');};
r.onend=()=>{if(recognition!==r)return;recognition=null;if(!activeSession||failed)return;if(finalText.trim())send(finalText.trim());else{activeSession=false;setVoice('idle','没有听到完整的话，点击麦克风再试一次。')}};
try{setVoice('starting','正在开启麦克风…');r.start()}catch{recognition=null;activeSession=false;setVoice('error','无法启动麦克风，请检查浏览器权限后重试。')}}
function speakReply(text){stopRecognition();cancelSpeech();const epoch=voiceEpoch;const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=1.05;u.pitch=1.25;const voices=window.speechSynthesis.getVoices();const chinese=voices.find(v=>v.lang==='zh-CN')||voices.find(v=>/^zh/i.test(v.lang));if(chinese)u.voice=chinese;
setVoice('speaking','Tom 正在说话…');
const finish=failed=>{if(epoch!==voiceEpoch)return;clearTimeout(speechWatchdog);voiceEpoch++;$('#room-cat').classList.remove('speaking');if(failed){activeSession=false;window.speechSynthesis.cancel();setVoice('error','语音播放失败，你可以点击“重听 Tom 的回答”。');return}setVoice('idle','Tom 说完啦。');scheduleListen()};
u.onstart=()=>{if(epoch!==voiceEpoch)return;clearTimeout(speechWatchdog);$('#room-cat').classList.add('speaking');speechWatchdog=setTimeout(()=>finish(true),Math.max(30000,text.length*1200))};
u.onboundary=()=>{if(epoch!==voiceEpoch)return;$('#room-cat').style.setProperty('--mouth-speed',(100+Math.random()*120)+'ms')};u.onend=()=>finish(false);u.onerror=()=>finish(true);
speechWatchdog=setTimeout(()=>finish(true),12000);window.speechSynthesis.speak(u)}
$('#mic').onclick=()=>{if(activeSession){stopSession();return}if(!key||verified!==key||state!=='success'){setVoice('error','请先输入有效的 OpenRouter API Key。');return}if(busy){setVoice('thinking','Tom 还在思考，请稍等再开启语音。');return}activeSession=true;startListening()};
$('#interrupt').onclick=()=>{cancelSpeech();setVoice('idle','Tom 停下啦，你来说。');if(activeSession)startListening()};
$('#replay').onclick=()=>{if(!lastReply||busy)return;activeSession=false;clearTimeout(restartTimer);speakReply(lastReply)};
$('#clear').onclick=()=>{if(busy)return;stopSession();history=[];lastReply='';$('#messages').replaceChildren();bubble('喵～新的一页！点击麦克风继续和我说话。','bot');$('#live-caption').textContent='你说的话，会显示在这里。';$('#replay').disabled=true;};
$('#room-cat').onclick=()=>{if(busy||voicePhase==='listening'||voicePhase==='speaking')return;$('#room-cat').classList.remove('wave');void $('#room-cat').offsetWidth;$('#room-cat').classList.add('wave');$('#pet-speech').textContent='喵～被你摸摸，好开心！';$('#mood').textContent='✦ 心情：开心 · 动作：挥手';if(hasSynthesis)speakReply('喵，被你摸摸，好开心！')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSession()});window.addEventListener('pagehide',stopSession);
