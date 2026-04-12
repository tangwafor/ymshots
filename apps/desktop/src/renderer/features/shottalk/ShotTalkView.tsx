import React, { useState } from 'react';

const ACCENT = '#E0943A';

interface Thread {
  id: string;
  title: string;
  lastMessage?: string;
  lastSender?: string;
  lastTime?: string;
  unread: number;
}

// Mock data for UI skeleton
const MOCK_THREADS: Thread[] = [];

export function ShotTalkView() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Thread list */}
      <div style={{
        width: 280, borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>ShotTalk</span>
          <button style={{
            padding: '4px 10px', borderRadius: 4, border: 'none',
            backgroundColor: ACCENT, color: '#fff', fontSize: 11,
            fontWeight: 600, cursor: 'pointer',
          }}>
            + New
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {MOCK_THREADS.length === 0 ? (
            <div style={{
              padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.2)',
              fontSize: 12, lineHeight: 1.7,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{'\u{1F4AC}'}</div>
              <p>No conversations yet.</p>
              <p style={{ marginTop: 4 }}>Create a thread to start chatting with your clients — right here, tied to their shoot.</p>
            </div>
          ) : (
            MOCK_THREADS.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedThread(t.id)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  borderBottom: '1px solid #111',
                  backgroundColor: selectedThread === t.id ? '#1a1a1a' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                  {t.unread > 0 && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 8, fontSize: 10,
                      backgroundColor: ACCENT, color: '#fff', fontWeight: 600,
                    }}>
                      {t.unread}
                    </span>
                  )}
                </div>
                {t.lastMessage && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{t.lastSender}:</strong> {t.lastMessage}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedThread ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.15)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{1F4F7}'}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
              Communication, simplified.
            </div>
            <div style={{ fontSize: 12, maxWidth: 320, textAlign: 'center', lineHeight: 1.7 }}>
              Every conversation is tied to a shoot. Tap photos to leave pinned feedback.
              Clients see messages in their gallery — no app install needed.
            </div>

            {/* Feature list */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Shoot threads', 'One conversation per client project'],
                ['Photo annotations', 'Tap a photo to pin feedback on the exact spot'],
                ['Auto-notifications', '"Gallery ready", "Selections received", "Invoice sent"'],
                ['Email bridge', 'Clients reply by email — it shows up here'],
                ['File sharing', 'Send proofs, contracts, invoices inline'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <span style={{ color: ACCENT }}>{'\u2713'}</span>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>— {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12, padding: 40 }}>
                Messages will appear here
              </div>
            </div>

            {/* Compose */}
            <div style={{
              padding: '10px 16px', borderTop: '1px solid #1a1a1a',
              display: 'flex', gap: 8,
            }}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6,
                  border: '1px solid #222', backgroundColor: '#111',
                  color: '#fff', fontSize: 13,
                }}
              />
              <button style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                backgroundColor: ACCENT, color: '#fff', fontSize: 12,
                fontWeight: 600, cursor: 'pointer',
              }}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
