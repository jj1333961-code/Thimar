package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuranReaderScreen(
    audioPlayer: ThimarAudioPlayer
) {
    var selectedSurahId by remember { mutableStateOf(24) } // Default Surah An-Nur
    var selectedReciterId by remember { mutableStateOf("minshawi") }
    var fontSize by remember { mutableStateOf(26f) }
    var showTafsirDialog by remember { mutableStateOf(false) }

    val surahs = ThimarRepository.surahs
    val selectedSurah = surahs.find { it.id == selectedSurahId } ?: surahs.first()
    val isPlaying = audioPlayer.isPlaying && audioPlayer.currentTrackId == "quran_${selectedSurah.id}"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ThimarBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Controls Header Card
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Surah Selector row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        var expandedSurahDropdown by remember { mutableStateOf(false) }

                        Box {
                            OutlinedButton(
                                onClick = { expandedSurahDropdown = true },
                                shape = RoundedCornerShape(14.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, ThimarBorder)
                            ) {
                                Text(
                                    text = "سورة ${selectedSurah.name}",
                                    fontWeight = FontWeight.Bold,
                                    color = ThimarEmeraldDark
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(imageVector = Icons.Default.ArrowDropDown, contentDescription = null)
                            }

                            DropdownMenu(
                                expanded = expandedSurahDropdown,
                                onDismissRequest = { expandedSurahDropdown = false }
                            ) {
                                surahs.forEach { s ->
                                    DropdownMenuItem(
                                        text = { Text("سورة ${s.name} (${s.versesCount} آية)") },
                                        onClick = {
                                            selectedSurahId = s.id
                                            expandedSurahDropdown = false
                                        }
                                    )
                                }
                            }
                        }

                        // Font size buttons
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            FilledTonalIconButton(
                                onClick = { if (fontSize < 42f) fontSize += 3f },
                                shape = CircleShape
                            ) {
                                Text("+A", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            FilledTonalIconButton(
                                onClick = { if (fontSize > 18f) fontSize -= 3f },
                                shape = CircleShape
                            ) {
                                Text("-A", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                    }

                    // Audio Reciter Row
                    Surface(
                        color = ThimarEmeraldContainer,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Headphones,
                                    contentDescription = null,
                                    tint = ThimarEmeraldPrimary
                                )
                                Column {
                                    Text(
                                        text = "القارئ: الشيخ محمد صديق المنشاوي",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = ThimarEmeraldDark
                                    )
                                    Text(
                                        text = "المصحف المرتل برواية حفص عن عاصم",
                                        fontSize = 11.sp,
                                        color = ThimarEmeraldOnContainer.copy(alpha = 0.8f)
                                    )
                                }
                            }

                            IconButton(
                                onClick = {
                                    audioPlayer.playTrack("quran_${selectedSurah.id}")
                                },
                                modifier = Modifier
                                    .size(42.dp)
                                    .background(ThimarEmeraldPrimary, CircleShape)
                            ) {
                                Icon(
                                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = if (isPlaying) "إيقاف" else "تشغيل",
                                    tint = Color.White
                                )
                            }
                        }
                    }
                }
            }
        }

        // Quran Page Main View
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Header Frame
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                Brush.horizontalGradient(
                                    listOf(ThimarEmeraldDark, ThimarEmeraldPrimary)
                                )
                            )
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "سُورَةُ ${selectedSurah.name}",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp
                        )
                    }

                    // Bismillah
                    Text(
                        text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                        fontWeight = FontWeight.Bold,
                        fontSize = (fontSize * 0.95f).sp,
                        color = ThimarEmeraldDark,
                        textAlign = TextAlign.Center
                    )

                    // Ayah Text
                    Text(
                        text = selectedSurah.sampleText,
                        fontSize = fontSize.sp,
                        lineHeight = (fontSize * 1.9f).sp,
                        color = ThimarTextPrimary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Divider(color = ThimarBorder, thickness = 1.dp)

                    // Page Navigation & Tafsir Action
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "الجزء: ${selectedSurah.juz} • صفحة ${selectedSurah.startPage}",
                            color = ThimarTextMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )

                        TextButton(
                            onClick = { showTafsirDialog = true }
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = ThimarAmberAccent
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "تفسير الآيات",
                                color = ThimarAmberAccent,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }

    if (showTafsirDialog) {
        AlertDialog(
            onDismissRequest = { showTafsirDialog = false },
            confirmButton = {
                TextButton(onClick = { showTafsirDialog = false }) {
                    Text("إغلاق", color = ThimarEmeraldPrimary, fontWeight = FontWeight.Bold)
                }
            },
            title = {
                Text("تفسير سورة ${selectedSurah.name}", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    text = "سورة ${selectedSurah.name} من السور العظيمة التي بيّن الله تعالى فيها دلائل قدرته وفرائضه وأحكامه الجليلة للمؤمنين. وقد ابتدأت بتعظيم ما أنزل فيها من الأحكام والآيات البينات ليتذكر المؤمنون ويعملوا بما فيها من هداية ونور.",
                    lineHeight = 24.sp,
                    color = ThimarTextPrimary
                )
            },
            shape = RoundedCornerShape(20.dp)
        )
    }
}
