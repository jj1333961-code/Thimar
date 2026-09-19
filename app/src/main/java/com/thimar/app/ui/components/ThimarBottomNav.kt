package com.thimar.app.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.thimar.app.ui.theme.ThimarEmeraldPrimary
import com.thimar.app.ui.theme.ThimarTextMuted

enum class ThimarTab(val titleAr: String, val icon: ImageVector) {
    HOME("الرئيسية", Icons.Default.Home),
    QURAN("المصحف", Icons.Default.MenuBook),
    TAJWEED("التجويد", Icons.Default.AutoStories),
    TASKS("المهام", Icons.Default.Assignment),
    MESSAGES("الرسائل", Icons.Default.Forum),
    REPORTS("التقارير", Icons.Default.Assessment)
}

@Composable
fun ThimarBottomNav(
    currentTab: ThimarTab,
    onTabSelected: (ThimarTab) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp
    ) {
        ThimarTab.values().forEach { tab ->
            val isSelected = currentTab == tab
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                icon = {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.titleAr,
                        modifier = Modifier.size(22.dp)
                    )
                },
                label = {
                    Text(
                        text = tab.titleAr,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ThimarEmeraldPrimary,
                    selectedTextColor = ThimarEmeraldPrimary,
                    unselectedIconColor = ThimarTextMuted,
                    unselectedTextColor = ThimarTextMuted,
                    indicatorColor = Color(0xFFECFDF5)
                )
            )
        }
    }
}
