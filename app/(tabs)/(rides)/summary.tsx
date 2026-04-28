import { AuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import {
    Alert, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from "react-native";

type CostEntry = {
    category: string;
    label: string;
    amount: string;
};

const COST_CATEGORIES: CostEntry[] = [
    { category: "fuel", label: "Fuel / Trailhead drive ($)", amount: "" },
    { category: "food", label: "Food & Drinks ($)", amount: "" },
    { category: "gear", label: "Gear / Equipment ($)", amount: "" },
    { category: "maintenance", label: "Bike Maintenance ($)", amount: "" },
    { category: "entry", label: "Park / Trail Entry Fee ($)", amount: "" },
    { category: "other", label: "Other ($)", amount: "" },
];

export default function Summary() {
    const { distance, duration, coords } = useLocalSearchParams();
    const context = useContext(AuthContext);
    const session = context?.session;

    const [notes, setNotes] = useState("");
    const [costs, setCosts] = useState<CostEntry[]>(COST_CATEGORIES);
    const [saving, setSaving] = useState(false);

    const durationSecs = parseInt(duration as string) || 0;
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const dist = parseFloat(distance as string) || 0;

    const totalCost = costs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const costPerMile = dist > 0 ? (totalCost / dist).toFixed(2) : "0.00";

    const updateCost = (category: string, amount: string) => {
        setCosts((prev) =>
            prev.map((c) => (c.category === category ? { ...c, amount } : c))
        );
    };

    const handleSave = async () => {
        if (!session?.user) return;
        setSaving(true);

        const costsJson = costs
            .filter((c) => parseFloat(c.amount) > 0)
            .reduce((acc, c) => ({ ...acc, [c.category]: parseFloat(c.amount) }), {} as Record<string, number>);

        const parsedCoords = (() => {
            try { return JSON.parse(coords as string); } catch { return []; }
        })();

        const { error } = await supabase.from("logs").insert({
            user_id: session.user.id,
            distance: dist,
            duration: mins, // stored as minutes per your schema
            notes: notes || null,
            path: parsedCoords,
            costs: Object.keys(costsJson).length > 0 ? costsJson : null,
        });

        setSaving(false);

        if (error) {
            Alert.alert("Error saving ride", error.message);
            return;
        }

        router.replace("/(tabs)" as any);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            <Text style={styles.heading}>Ride Summary</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{dist.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>Miles</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{mins}:{secs < 10 ? '0' : ''}{secs}</Text>
                    <Text style={styles.statLabel}>Time</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                        {dist > 0 && mins > 0 ? (dist / (mins / 60)).toFixed(1) : "0"}
                    </Text>
                    <Text style={styles.statLabel}>mph avg</Text>
                </View>
            </View>

            {/* Notes */}
            <Text style={styles.sectionTitle}>Ride Notes</Text>
            <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="How was the ride? Trail conditions, highlights..."
                value={notes}
                onChangeText={setNotes}
                multiline
            />

            {/* Cost Tracker */}
            <Text style={styles.sectionTitle}>💸 Ride Costs</Text>
            <Text style={styles.sectionSubtitle}>Track the financial impact of this ride</Text>

            {costs.map((c) => (
                <View key={c.category} style={styles.costRow}>
                    <Text style={styles.costLabel}>{c.label}</Text>
                    <TextInput
                        style={styles.costInput}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={c.amount}
                        onChangeText={(val) => updateCost(c.category, val)}
                    />
                </View>
            ))}

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Cost per Mile</Text>
                <Text style={styles.totalValue}>${costPerMile}</Text>
            </View>

            {/* Save */}
            <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
            >
                <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Ride"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.discardButton} onPress={() => router.replace("/(tabs)" as any)}>
                <Text style={styles.discardText}>Discard Ride</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    content: { padding: 20, paddingBottom: 60 },
    heading: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 20 },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    statBox: {
        flex: 1, backgroundColor: "#111827", borderRadius: 14,
        padding: 16, alignItems: "center",
    },
    statValue: { fontSize: 22, fontWeight: "800", color: "#fff" },
    statLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },

    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4, marginTop: 8 },
    sectionSubtitle: { fontSize: 12, color: "#6b7280", marginBottom: 12 },

    input: {
        borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
        padding: 12, fontSize: 15, backgroundColor: "#fff", marginBottom: 16,
    },
    notesInput: { height: 90, textAlignVertical: "top" },

    costRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10,
    },
    costLabel: { flex: 1, fontSize: 14, color: "#374151" },
    costInput: {
        width: 90, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8,
        padding: 8, fontSize: 14, textAlign: "right", backgroundColor: "#fff",
    },

    totalRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 8, borderTopWidth: 1, borderColor: "#e5e7eb", marginTop: 4,
    },
    totalLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
    totalValue: { fontSize: 15, fontWeight: "700", color: "#111827" },

    saveButton: {
        backgroundColor: "#111827", borderRadius: 12, padding: 16,
        alignItems: "center", marginTop: 24,
    },
    saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    discardButton: { padding: 14, alignItems: "center", marginTop: 8 },
    discardText: { color: "#dc2626", fontSize: 15 },
});