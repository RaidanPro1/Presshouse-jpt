import { Component, ChangeDetectionStrategy, signal, OnDestroy, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-webrtc-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webrtc-call.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebrtcCallComponent implements OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  isCallActive = signal(false);
  isMicMuted = signal(false);
  isVideoOff = signal(false);
  isScreenSharing = signal(false);
  callStatus = signal('جاهز للانضمام');

  private stream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  constructor() {
    afterNextRender(() => {
      // Initialization if needed after view is ready
    });
  }

  async joinCall() {
    this.callStatus.set('جارِ الاتصال...');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = this.stream;
      this.isCallActive.set(true);
      this.callStatus.set('في المكالمة');
    } catch (err) {
      console.error('Error accessing media devices.', err);
      this.callStatus.set('فشل الوصول للكاميرا/المايك. تحقق من الأذونات.');
    }
  }

  leaveCall() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.screenStream?.getTracks().forEach(track => track.stop());
    this.isCallActive.set(false);
    this.isScreenSharing.set(false);
    this.isVideoOff.set(false);
    this.isMicMuted.set(false);
    this.callStatus.set('جاهز للانضمام');
    if(this.localVideo) {
        this.localVideo.nativeElement.srcObject = null;
    }
  }

  toggleMic() {
    this.isMicMuted.update(muted => !muted);
    this.stream?.getAudioTracks().forEach(track => track.enabled = !this.isMicMuted());
  }

  toggleVideo() {
    this.isVideoOff.update(off => !off);
    this.stream?.getVideoTracks().forEach(track => track.enabled = !this.isVideoOff());
  }

  async toggleScreenShare() {
     if (this.isScreenSharing()) {
        // Stop screen share
        this.screenStream?.getTracks().forEach(track => track.stop());
        this.localVideo.nativeElement.srcObject = this.stream; // Switch back to webcam
        this.isScreenSharing.set(false);
     } else {
        // Start screen share
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            this.localVideo.nativeElement.srcObject = this.screenStream;
            this.isScreenSharing.set(true);
            // Handle when user stops sharing from browser UI
            this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                if (this.isScreenSharing()) {
                  this.toggleScreenShare();
                }
            });
        } catch(err) {
            console.error("Error starting screen share", err);
        }
     }
  }

  ngOnDestroy(): void {
    this.leaveCall();
  }
}
