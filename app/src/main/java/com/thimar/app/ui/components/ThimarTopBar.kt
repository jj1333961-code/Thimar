package com.thimar.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SupervisorAccount
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.model.UserRole
import com.thimar.app.ui.theme.*

@Composable
fun ThimarTopBar(
    currentRole: UserRole,
    onRoleSelected: (UserRole) -> Unit,
    onInfoClick: () -> Unit
) {
    Surface(
        color = Color.White,
        tonalElevation = 2.dp,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Main Top Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Thimar Brand Logo & Name
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(ThimarEmeraldPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "ث",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 22.sp
                        )
                    }

                    Column {
                        Text(
                            text = "ثمار",
                            style = MaterialTheme.typography.titleLarge,
                            color = ThimarEmeraldDark,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = currentRole.titleAr,
                            style = MaterialTheme.typography.labelSmall,
                            color = ThimarTextSecondary
                        )
                    }
                }

                // Action icons: Tour/Info and Notifications
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onInfoClick) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "جولة المنصة",
                            tint = ThimarEmeraldPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Role Switcher Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                UserRole.values().forEach { role ->
                    val isSelected = currentRole == role
                    val roleColor = when (role) {
                        UserRole.STUDENT -> ThimarEmeraldPrimary
                        UserRole.TEACHER -> ThimarBlue
                        UserRole.PARENT -> ThimarAmberAccent
                        UserRole.ADMIN -> Color(0xFF374151)
                    }

                    Surface(
                        onClick = { onRoleSelected(role) },
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) roleColor else ThimarSurfaceVariant,
                        modifier = Modifier.height(36.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(horizontal = 12.dp)
                        ) {
                            val icon = when (role) {
                                UserRole.STUDENT -> Icons.Default.School
                                UserRole.TEACHER -> Icons.Default.Person
                                UserRole.PARENT -> Icons.Default.SupervisorAccount
                                UserRole.ADMIN -> Icons.Default.Security
                            }
                            Icon(
                                imageVector = icon,
                                contentDescription = role.labelAr,
                                modifier = Modifier.size(16.dp),
                                tint = if (isSelected) Color.White else ThimarTextSecondary
                            )
                            Text(
                                text = role.labelAr,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else ThimarTextPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
