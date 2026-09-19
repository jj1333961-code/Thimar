package com.thimar.app.audio

import android.content.Context
import android.media.MediaPlayer
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.thimar.app.R

class ThimarAudioPlayer(private val context: Context) {
    private var mediaPlayer: MediaPlayer? = null
    var isPlaying by mutableStateOf(false)
        private set
    var currentTrackId by mutableStateOf<String?>(null)
        private set

    fun playTrack(trackId: String, resId: Int = R.raw.ibrahim_ayah_24_minshawi) {
        if (currentTrackId == trackId && isPlaying) {
            pause()
            return
        }

        stop()

        try {
            mediaPlayer = MediaPlayer.create(context, resId)?.apply {
                setOnCompletionListener {
                    isPlaying = false
                    currentTrackId = null
                }
                start()
                this@ThimarAudioPlayer.isPlaying = true
                this@ThimarAudioPlayer.currentTrackId = trackId
            }
        } catch (e: Exception) {
            e.printStackTrace()
            isPlaying = false
            currentTrackId = null
        }
    }

    fun pause() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.pause()
                isPlaying = false
            }
        }
    }

    fun resume() {
        mediaPlayer?.let {
            if (!it.isPlaying) {
                it.start()
                isPlaying = true
            }
        }
    }

    fun stop() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            mediaPlayer = null
            isPlaying = false
            currentTrackId = null
        }
    }
}
