import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Profile() {
    const context = useContext(AuthContext);
    const session = context?.session;

    const username = session?.user?.email?.split('@')[0] || "Rider";
    const email = session?.user?.email || "No email";
    const memberSince = session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Unknown";

    const [logs, setLogs] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchStats = async () => {
        if (!session?.user) return;

        const { data, error } = await supabase
            .from("logs")
            .select("distance")
            .eq("user_id", session.user.id);

        if (!error) setLogs(data || []);
        setLoadingStats(false);
    };

    useFocusEffect(
    useCallback(() => {
        if (session?.user) fetchStats();
    }, [session])
);

    const totalMiles = logs.reduce((sum, log) => sum + (log.distance || 0), 0);
    const totalRides = logs.length;
    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const handleLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to sign out?");

        if (!confirmed) return;

        const { error } = await supabase.auth.signOut({ scope: "local" });

        if (error) {
            window.alert("Error: " + error.message);
            return;
        }

        window.location.href = "/";
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                </View>

                <Text style={styles.username}>{username}</Text>
                <Text style={styles.email}>{email}</Text>
                <Text style={styles.memberSince}>Member since {memberSince}</Text>

            </View>

            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {loadingStats ? "-" : totalMiles.toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>Total Miles</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {loadingStats ? "-" : totalRides}
                    </Text>
                    <Text style={styles.statLabel}>Total Rides</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {loadingStats ? "-" : totalHours}
                    </Text>
                    <Text style={styles.statLabel}>Total Hours</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {loadingStats ? "-" : totalRides > 0 ? (totalMiles / totalRides).toFixed(1) : "0"}
                    </Text>
                    <Text style={styles.statLabel}>Average Miles</Text>
                </View>
            </View>


            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuCard}>
                <View style={styles.menuRow}>
                    <Text style={styles.menuLabel}>Email</Text>
                    <Text style={styles.menuValue}>{email}</Text>
                </View>

                <View style={styles.divider} />
                <View style={styles.menuRow}>
                    <Text style={styles.menuLabel}>Username</Text>
                    <Text style={styles.menuValue}>{username}</Text>
                </View>

                <View style={styles.divider} />
                <View style={styles.menuRow}>
                    <Text style={styles.menuLabel}>Member Since</Text>
                    <Text style={styles.menuValue}>{memberSince}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 48,
    },

    // Avatar
    avatarSection: {
        alignItems: "center",
        paddingVertical: 28,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#111827",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
    },
    username: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },
    email: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    memberSince: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 4,
    },

    // Stats
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 10,
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        width: "47%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    statValue: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111827",
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },

    // Menu Card
    menuCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 24,
        overflow: "hidden",
    },
    menuRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
    },
    menuLabel: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "600",
    },
    menuValue: {
        fontSize: 14,
        color: "#6b7280",
        maxWidth: "60%",
        textAlign: "right",
    },
    divider: {
        height: 1,
        backgroundColor: "#f3f4f6",
        marginHorizontal: 14,
    },

    // Sign Out
    signOutButton: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#fca5a5",
    },
    signOutText: {
        color: "#dc2626",
        fontWeight: "700",
        fontSize: 15,
    },
});