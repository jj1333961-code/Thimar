package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.audio.ThimarAudioPlayer
import com.thimar.app.data.ThimarRepository
import com.thimar.app.ui.theme.*

@Composable
fun TuhfatAlAtfalScreen(
    audioPlayer: ThimarAudioPlayer
) {
    val sections = ThimarRepository.tuhfatSections
    var activeSectionIndex by remember { mutableStateOf(0) }
    val currentSection = sections.getOrElse(activeSectionIndex) { sections.first() }
    val isPlaying = audioPlayer.isPlaying && audioPlayer.currentTrackId == "tuhfat_${currentSection.id}"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ThimarBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Header
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = ThimarEmeraldPrimary),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                listOf(ThimarEmeraldDark, ThimarEmeraldPrimary)
                            )
                        )
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Color.White.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AutoStories,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            }
                            Column {
                                Text(
                                    text = "تحفة الأطفال والغلمان",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                                Text(
                                    text = "متن الشيخ سليمان الجمزوري في التجويد",
                                    color = Color.White.copy(alpha = 0.8f),
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section Tabs Row
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                sections.forEachIndexed { index, sec ->
                    val isSelected = activeSectionIndex == index
                    Surface(
                        onClick = { activeSectionIndex = index },
                        shape = RoundedCornerShape(14.dp),
                        color = if (isSelected) ThimarEmeraldPrimary else Color.White,
                        border = if (!isSelected) androidx.compose.foundation.BorderStroke(1.dp, ThimarBorder) else null
                    ) {
                        Text(
                            text = sec.title,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else ThimarTextPrimary,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        // Audio Player Bar
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(ThimarEmeraldContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.VolumeUp,
                                contentDescription = null,
                                tint = ThimarEmeraldPrimary
                            )
                        }
                        Column {
                            Text(
                                text = "تسجيل صوتي للمتن",
                                fontWeight = FontWeight.Bold,
                                color = ThimarTextPrimary,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "بصوت الشيخ المقرئ",
                                color = ThimarTextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = {
                                if (activeSectionIndex > 0) activeSectionIndex--
                            }
                        ) {
                            Icon(Icons.Default.SkipPrevious, contentDescription = "السابق")
                        }

                        IconButton(
                            onClick = {
                                audioPlayer.playTrack("tuhfat_${currentSection.id}")
                            },
                            modifier = Modifier
                                .size(44.dp)
                                .background(ThimarEmeraldPrimary, CircleShape)
                        ) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isPlaying) "إيقاف" else "تشغيل",
                                tint = Color.White
                            )
                        }

                        IconButton(
                            onClick = {
                                if (activeSectionIndex < sections.size - 1) activeSectionIndex++
                            }
                        ) {
                            Icon(Icons.Default.SkipNext, contentDescription = "التالي")
                        }
                    }
                }
            }
        }

        // Verses Card
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = currentSection.title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                        color = ThimarAmberAccent
                    )

                    Divider(color = ThimarBorder, thickness = 1.dp)

                    currentSection.verses.forEachIndexed { vIdx, verse ->
                        val parts = verse.split("**")
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = parts.firstOrNull()?.trim() ?: verse,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThimarTextPrimary,
                                textAlign = TextAlign.Center
                            )
                            if (parts.size > 1) {
                                Text(
                                    text = parts[1].trim(),
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThimarEmeraldDark,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                        if (vIdx < currentSection.verses.size - 1) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(ThimarAmberLight.copy(alpha = 0.5f))
                            )
                        }
                    }
                }
            }
        }
    }
}
