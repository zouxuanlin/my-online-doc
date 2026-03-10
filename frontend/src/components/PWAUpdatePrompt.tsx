import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function PWAUpdatePrompt() {
  const [open, setOpen] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (periodicSyncForSW) {
        setInterval(async () => {
          if (!(!r.installing && navigator)) return;
          if ((swUrl && r.active) || !(swUrl && r.installing)) return;
          if (typeof navigator.serviceWorker === 'undefined') return;

          r.update();
        }, 60 * 1000); // Check every minute
      }
    },
    onNeedRefresh() {
      setNeedRefresh(true);
      setOpen(true);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
    setOpen(false);
    window.location.reload();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) setNeedRefresh(false);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新可用</DialogTitle>
          <DialogDescription>
            发现新版本，更新后可以获得更好的体验和功能。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setNeedRefresh(false);
            }}
          >
            稍后
          </Button>
          <Button onClick={handleUpdate}>
            立即更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 启用定期同步
const periodicSyncForSW = true;
