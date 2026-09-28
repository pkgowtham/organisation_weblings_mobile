import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/context/CustomThemeContext";
import { MoreVert, Add, Remove } from "@/svg_icons";
import { Image } from "expo-image";

export type OrgNodeData = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  children?: OrgNodeData[];
};

type OrgTreeNodeProps = {
  data: OrgNodeData;
  isLast?: boolean;
  level?: number;
  isRoleMode?: boolean;
  onAddChild?: (node: OrgNodeData) => void;
  onRemoveNode?: (node: OrgNodeData) => void;
  onEditNode?: (node: OrgNodeData) => void;
};

export default function OrgTreeNode({
  data,
  isLast = true,
  level = 0,
  isRoleMode = false,
  onAddChild,
  onRemoveNode,
  onEditNode,
}: OrgTreeNodeProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const hasChildren = data.children && data.children.length > 0;

  return (
    <View style={styles.container}>
      {/* 
        If it's not the root (level > 0), we want a horizontal connecting line 
        from the left border to the card.
      */}
      {level > 0 && (
        <View
          style={[
            styles.horizontalLine,
            { backgroundColor: theme.colors.neutral.border.light },
          ]}
        />
      )}

      {/* The Node Card */}
      <View style={isRoleMode ? styles.roleCard : styles.card}>
        <View style={styles.cardLeft}>
          {!isRoleMode && (
            <Image
              source={{
                uri:
                  data.avatarUrl ||
                  "https://i.pravatar.cc/150?u=" + data.id,
              }}
              style={styles.avatar}
            />
          )}
          <View style={styles.infoContainer}>
            <Typography
              fontVariant="BM"
              variant="semibold"
              color="colors.neutral.onSurface.light"
            >
              {data.name}
            </Typography>
            {!isRoleMode && (
              <Typography
                fontVariant="BS"
                color="colors.neutral.onSurface.dark"
              >
                {data.role}
              </Typography>
            )}
          </View>
        </View>

        <View style={styles.cardRight}>
          {!hasChildren && (
            <TouchableOpacity
              style={styles.actionBtnInside}
              onPress={() => onAddChild && onAddChild(data)}
            >
              <Add width={12} height={12} color={theme.colors.neutral.surface.lighter} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={(e) => {
              const target = e.currentTarget;
              target.measure((_x, _y, _w, _h, pageX, pageY) => {
                setMenuPosition({ x: pageX - 80, y: pageY + _h });
                setMenuVisible(true);
              });
            }}
          >
            <MoreVert width={20} height={20} color={theme.colors.neutral.onSurface.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Menu */}
      {menuVisible && (
        <Modal transparent visible={menuVisible} animationType="none" onRequestClose={() => setMenuVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={[
            styles.contextMenu,
            { top: menuPosition.y, left: menuPosition.x }
          ]}>
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => { setMenuVisible(false); onEditNode && onEditNode(data); }}
            >
              <Typography fontVariant="BS" color="colors.neutral.onSurface.light">Edit</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => { setMenuVisible(false); onRemoveNode && onRemoveNode(data); }}
            >
              <Typography fontVariant="BS" color="colors.semantic.error.medium">Delete</Typography>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Children Container (always visible) */}
      {hasChildren && (
        <View style={styles.childrenContainerWrapper}>
          {/* 
            The vertical line that connects all children.
          */}
          <View
            style={[
              styles.verticalLine,
              { backgroundColor: theme.colors.neutral.border.light },
            ]}
          />

          {/* Action button: Add child (+) on the vertical line */}
          <View style={styles.addChildNodeBtnWrapper}>
            <TouchableOpacity
              style={styles.addChildNodeBtn}
              onPress={() => onAddChild && onAddChild(data)}
            >
              <Add width={12} height={12} color={theme.colors.neutral.surface.lighter} />
            </TouchableOpacity>
          </View>

          <View style={styles.childrenWrapper}>
            {data.children!.map((child, index) => (
              <OrgTreeNode
                key={child.id}
                data={child}
                isLast={index === data.children!.length - 1}
                level={level + 1}
                isRoleMode={isRoleMode}
                onAddChild={onAddChild}
                onRemoveNode={onRemoveNode}
                onEditNode={onEditNode}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      position: "relative",
      marginTop: theme.spacing.s400,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b150,
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      width: 300,
      zIndex: 2,
    },
    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b150,
      paddingVertical: theme.spacing.s200,
      paddingHorizontal: theme.spacing.s400,
      width: 260,
      zIndex: 2,
    },
    cardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s300,
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    infoContainer: {
      flex: 1,
      alignItems: "flex-start",
    },
    cardRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s200,
    },
    actionBtnInside: {
      backgroundColor: theme.colors.brand.surface.medium,
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.b50,
      justifyContent: "center",
      alignItems: "center",
    },
    moreBtn: {
      padding: theme.spacing.s100,
    },
    contextMenu: {
      position: "absolute",
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b150,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      minWidth: 120,
      zIndex: 100,
    },
    contextMenuItem: {
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
    },
    // Connecting Lines
    childrenContainerWrapper: {
      position: "relative",
      paddingLeft: 32,
    },
    childrenWrapper: {},
    verticalLine: {
      position: "absolute",
      left: 16,
      top: 0,
      bottom: 24,
      width: 1,
      zIndex: 1,
    },
    horizontalLine: {
      position: "absolute",
      left: -16,
      top: 36,
      width: 16,
      height: 1,
      zIndex: 1,
    },
    addChildNodeBtnWrapper: {
      position: "absolute",
      left: 8,
      top: 16,
      zIndex: 3,
    },
    addChildNodeBtn: {
      backgroundColor: theme.colors.brand.surface.medium,
      width: 16,
      height: 16,
      borderRadius: theme.borderRadius.b50,
      justifyContent: "center",
      alignItems: "center",
    },
  });
