import type { FastifyInstance } from 'fastify';
import { getDb } from '@ymshots/db';

/**
 * GalleryBox Public Routes — Client-facing gallery pages.
 *
 * Design rules (from CLAUDE.md):
 * - Background: #0A0A0A always
 * - Photographer's name is everything. YmShotS is invisible.
 * - No photo count displayed
 * - No sound on client side
 * - Mobile-first (390px)
 * - Zero external dependencies (inline CSS, no CDN)
 * - Selections persist without login (slug = auth token)
 * - Hearts, not checkboxes
 */
export async function galleryPublicRoutes(app: FastifyInstance) {
  const db = getDb();

  // GET /g/:slug — Public gallery page (self-contained HTML)
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const gallery = await db.gallery.findUnique({
      where: { slug },
      include: {
        user: { select: { fullName: true } },
        shoot: { select: { name: true } },
        photos: {
          orderBy: { sortOrder: 'asc' },
          include: {
            photo: {
              select: { id: true, widthPx: true, heightPx: true, previewPath: true, thumbnailPath: true },
            },
          },
        },
      },
    });

    if (!gallery) {
      return reply.status(404).type('text/html').send(renderNotFound());
    }

    if (gallery.status === 'EXPIRED') {
      return reply.type('text/html').send(renderExpired(gallery.user.fullName));
    }

    // Check password if set
    if (gallery.passwordHash) {
      const { password } = request.query as { password?: string };
      if (!password) {
        return reply.type('text/html').send(renderPasswordGate(slug, gallery.user.fullName));
      }
      const bcrypt = require('bcrypt');
      const valid = await bcrypt.compare(password, gallery.passwordHash);
      if (!valid) {
        return reply.type('text/html').send(renderPasswordGate(slug, gallery.user.fullName, true));
      }
    }

    // Increment view count
    await db.gallery.update({ where: { id: gallery.id }, data: { viewCount: { increment: 1 } } });

    const photographerName = gallery.user.fullName;
    const shootName = gallery.shoot.name;
    const subtitle = gallery.subtitle || '';
    const photos = gallery.photos.map(gp => ({
      id: gp.photo.id,
      width: gp.photo.widthPx,
      height: gp.photo.heightPx,
      selected: gp.clientSelected,
      comment: gp.clientComment,
    }));

    return reply.type('text/html').send(renderGallery({
      slug,
      photographerName,
      shootName,
      subtitle,
      photos,
      downloadAllowed: gallery.downloadAllowed,
    }));
  });

  // POST /g/:slug/select — Client heart tap
  app.post('/:slug/select', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { photoId, selected, comment } = request.body as {
      photoId: string; selected: boolean; comment?: string;
    };

    const gallery = await db.gallery.findUnique({ where: { slug } });
    if (!gallery) return reply.status(404).send({ error: 'Gallery not found' });

    await db.galleryPhoto.update({
      where: { galleryId_photoId: { galleryId: gallery.id, photoId } },
      data: { clientSelected: selected, clientComment: comment },
    });

    // TODO: Fire SSE event to photographer's desktop app
    // This would push via Redis pub/sub → SSE connection

    return { ok: true };
  });

  // POST /g/:slug/message — Client sends ShotTalk message from gallery
  app.post('/:slug/message', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { senderName, body: msgBody } = request.body as { senderName: string; body: string };

    const gallery = await db.gallery.findUnique({
      where: { slug },
      select: { id: true, userId: true, shootId: true },
    });
    if (!gallery) return reply.status(404).send({ error: 'Gallery not found' });

    // Find or create a ShotTalk thread for this gallery
    let thread = await db.shotTalkThread.findFirst({
      where: { userId: gallery.userId, galleryId: gallery.id },
    });

    if (!thread) {
      thread = await db.shotTalkThread.create({
        data: {
          userId: gallery.userId,
          galleryId: gallery.id,
          shootId: gallery.shootId,
          title: `Gallery: ${slug}`,
        },
      });
    }

    const message = await db.shotTalkMessage.create({
      data: {
        threadId: thread.id,
        senderType: 'CLIENT',
        senderName,
        body: msgBody,
      },
    });

    await db.shotTalkThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    });

    return { ok: true, messageId: message.id };
  });

  // GET /g/:slug/events — SSE stream for real-time updates to photographer
  app.get('/:slug/events', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      reply.raw.write(': keepalive\n\n');
    }, 15000);

    // TODO: Subscribe to Redis pub/sub channel for this gallery
    // When client selects a photo or sends a message, publish to channel
    // For now, just keep the connection open

    request.raw.on('close', () => {
      clearInterval(keepAlive);
    });
  });
}

// ═══════════════════════════════════════════════════════
// HTML RENDERERS — Self-contained, zero external deps
// ═══════════════════════════════════════════════════════

function renderGallery(data: {
  slug: string; photographerName: string; shootName: string;
  subtitle: string; photos: Array<{ id: string; width: number; height: number; selected: boolean }>;
  downloadAllowed: boolean;
}): string {
  const photosJson = JSON.stringify(data.photos);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${data.shootName} — ${data.photographerName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0A;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow-x:hidden}
.arrival{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;animation:fadeIn 0.8s ease 0.2s forwards}
.photographer{font-size:22px;font-weight:300;letter-spacing:0.05em;opacity:0;animation:fadeIn 0.6s ease 0.4s forwards}
.shoot-name{font-size:13px;color:rgba(255,255,255,0.4);margin-top:8px;opacity:0;animation:fadeIn 0.6s ease 0.8s forwards}
.chevron{margin-top:48px;opacity:0;animation:fadeIn 0.6s ease 2.5s forwards;font-size:24px;color:rgba(255,255,255,0.2)}
.gallery{padding:16px;columns:2;column-gap:8px}
@media(min-width:768px){.gallery{columns:3;padding:24px;column-gap:12px}}
@media(min-width:1200px){.gallery{columns:4}}
.photo-wrap{break-inside:avoid;margin-bottom:8px;position:relative;border-radius:4px;overflow:hidden;cursor:pointer}
.photo-wrap img{width:100%;display:block;opacity:0;transition:opacity 0.4s ease}
.photo-wrap img.loaded{opacity:1}
.heart{position:absolute;bottom:8px;right:8px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;cursor:pointer;font-size:16px;border:none;color:rgba(255,255,255,0.6)}
.photo-wrap:hover .heart,.photo-wrap:active .heart{opacity:1}
.heart.selected{opacity:1;color:#E0943A;background:rgba(224,148,58,0.2)}
.selected-border{border:1.5px solid #E0943A}
.pill{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;border:1px solid #222;border-radius:20px;padding:8px 20px;font-size:13px;color:#E0943A;display:none;z-index:10;cursor:pointer}
.pill.visible{display:block}
.name-float{position:fixed;top:16px;left:16px;font-size:14px;color:rgba(255,255,255,0.6);z-index:10}
.footer{text-align:center;padding:40px 16px;font-size:11px;color:rgba(255,255,255,0.2)}
.msg-bar{position:fixed;bottom:60px;left:50%;transform:translateX(-50%);width:90%;max-width:400px;background:#111;border:1px solid #222;border-radius:12px;padding:12px 16px;z-index:10;display:none}
.msg-bar.visible{display:block}
.msg-bar input{width:100%;background:transparent;border:none;color:#fff;font-size:13px;outline:none}
.msg-bar button{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:#E0943A;border:none;color:#fff;padding:4px 12px;border-radius:6px;font-size:11px;cursor:pointer}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>
</head>
<body>
<!-- Arrival -->
<div class="arrival" id="arrival">
  <div class="photographer">${data.photographerName}</div>
  <div class="shoot-name">${data.shootName}${data.subtitle ? ' · ' + data.subtitle : ''}</div>
  <div class="chevron">&#8964;</div>
</div>

<!-- Photographer name float -->
<div class="name-float" style="display:none" id="nameFloat">${data.photographerName}</div>

<!-- Gallery grid -->
<div class="gallery" id="gallery" style="display:none"></div>

<!-- Selection pill -->
<div class="pill" id="pill" onclick="toggleMsgBar()"></div>

<!-- Message bar -->
<div class="msg-bar" id="msgBar">
  <input id="msgInput" placeholder="Add a note to ${data.photographerName.split(' ')[0]}..." />
  <button onclick="sendMessage()">Send</button>
</div>

<!-- Footer -->
<div class="footer" id="footer" style="display:none">Built by ta-tech</div>

<script>
const SLUG='${data.slug}';
const PHOTOS=${photosJson};
let selected=new Set(PHOTOS.filter(p=>p.selected).map(p=>p.id));

// Arrival → Gallery transition
setTimeout(()=>{
  document.getElementById('arrival').style.display='none';
  document.getElementById('gallery').style.display='block';
  document.getElementById('nameFloat').style.display='block';
  document.getElementById('footer').style.display='block';
  renderPhotos();
},3000);

function renderPhotos(){
  const g=document.getElementById('gallery');
  PHOTOS.forEach(p=>{
    const wrap=document.createElement('div');
    wrap.className='photo-wrap'+(selected.has(p.id)?' selected-border':'');
    wrap.id='pw-'+p.id;
    wrap.innerHTML=\`
      <img src="/api/v1/photos/\${p.id}/preview" onload="this.classList.add('loaded')" style="aspect-ratio:\${p.width}/\${p.height}" />
      <button class="heart \${selected.has(p.id)?'selected':''}" id="h-\${p.id}" onclick="toggleHeart('\${p.id}')">&#9829;</button>
    \`;
    g.appendChild(wrap);
  });
  updatePill();
}

function toggleHeart(id){
  if(selected.has(id)){selected.delete(id)}else{selected.add(id)}
  document.getElementById('h-'+id).classList.toggle('selected');
  document.getElementById('pw-'+id).classList.toggle('selected-border');
  updatePill();
  fetch('/g/'+SLUG+'/select',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photoId:id,selected:selected.has(id)})});
}

function updatePill(){
  const pill=document.getElementById('pill');
  if(selected.size>0){pill.classList.add('visible');pill.textContent=selected.size+' favourites'}
  else{pill.classList.remove('visible')}
}

let msgVisible=false;
function toggleMsgBar(){
  msgVisible=!msgVisible;
  document.getElementById('msgBar').classList.toggle('visible',msgVisible);
  if(msgVisible)document.getElementById('msgInput').focus();
}

function sendMessage(){
  const input=document.getElementById('msgInput');
  const body=input.value.trim();
  if(!body)return;
  fetch('/g/'+SLUG+'/message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({senderName:'Client',body})});
  input.value='';
  toggleMsgBar();
}
</script>
</body>
</html>`;
}

function renderPasswordGate(slug: string, photographerName: string, error = false): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${photographerName} Gallery</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0A0A;color:#fff;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}
.gate{text-align:center;max-width:300px}.name{font-size:20px;margin-bottom:24px}input{width:100%;padding:12px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;font-size:14px;text-align:center;margin-bottom:12px}
button{width:100%;padding:12px;border-radius:6px;border:none;background:#E0943A;color:#fff;font-size:14px;cursor:pointer}.err{color:#e74c3c;font-size:12px;margin-bottom:8px}</style></head>
<body><div class="gate"><div class="name">${photographerName}</div>${error ? '<div class="err">Incorrect password</div>' : ''}
<form method="GET"><input name="password" type="password" placeholder="Enter password" autofocus /><button type="submit">View Gallery</button></form></div></body></html>`;
}

function renderExpired(photographerName: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gallery Expired</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0A0A;color:#fff;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
.msg{color:rgba(255,255,255,0.4);font-size:14px;margin-top:12px}</style></head>
<body><div><div style="font-size:20px">${photographerName}</div><div class="msg">This gallery has expired.<br>Contact ${photographerName.split(' ')[0]} for access.</div></div></body></html>`;
}

function renderNotFound(): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not Found</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0A0A;color:rgba(255,255,255,0.3);font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}</style></head>
<body><div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">404</div><div>Gallery not found</div></div></body></html>`;
}
