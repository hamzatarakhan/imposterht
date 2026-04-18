import React, { useState } from "react";
import { useSavedGroups, PlayerGroup } from "@/hooks/useSavedGroups";
import { useSavedPlayers, SavedPlayer } from "@/hooks/useSavedPlayers";
import { useSettings } from "@/context/SettingsContext";
import { Plus, Trash2, Users, Edit2, Check, X, UserPlus, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup?: (members: SavedPlayer[]) => void;
  /** Initial tab to show ("names" | "groups"). Defaults to "groups". */
  initialTab?: "names" | "groups";
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose,
  onSelectGroup,
  initialTab = "groups",
}) => {
  const { groups, addGroup, updateGroup, removeGroup } = useSavedGroups();
  const { savedPlayers, addPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
  const { playSound, vibrate } = useSettings();

  const [tab, setTab] = useState<"names" | "groups">(initialTab);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingGroup, setEditingGroup] = useState<PlayerGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SavedPlayer[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberAvatar, setNewMemberAvatar] = useState("👤");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Names tab state
  const [newSavedName, setNewSavedName] = useState("");
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Sync tab when modal reopens with a different initialTab
  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setEditingGroup(null);
    setShowAddMember(false);
    setNewMemberName("");
    setNewMemberAvatar("👤");
  };

  const handleClose = () => {
    resetForm();
    setMode("list");
    onClose();
  };

  const handleCreateNew = () => {
    playSound("click");
    vibrate(30);
    resetForm();
    setMode("create");
  };

  const handleEditGroup = (group: PlayerGroup) => {
    playSound("click");
    vibrate(30);
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedMembers([...group.members]);
    setMode("edit");
  };

  const handleSaveGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 3) return;

    playSound("click");
    vibrate(50);

    if (mode === "edit" && editingGroup) {
      updateGroup(editingGroup.id, groupName, selectedMembers);
    } else {
      addGroup(groupName, selectedMembers);
    }

    addPlayers(selectedMembers);

    resetForm();
    setMode("list");
  };

  const handleSelectGroup = (group: PlayerGroup) => {
    playSound("click");
    vibrate(50);
    if (onSelectGroup) {
      onSelectGroup(group.members);
    }
    handleClose();
  };

  const handleDeleteGroup = (id: string) => {
    playSound("click");
    vibrate(30);
    removeGroup(id);
    setDeleteConfirmId(null);
  };

  const toggleMember = (player: SavedPlayer) => {
    playSound("click");
    vibrate(20);
    setSelectedMembers((current) => {
      const exists = current.some((m) => m.name.toLowerCase() === player.name.toLowerCase());
      if (exists) {
        return current.filter((m) => m.name.toLowerCase() !== player.name.toLowerCase());
      }
      return [...current, player];
    });
  };

  const handleAddNewMember = () => {
    const trimmedName = newMemberName.trim();
    if (!trimmedName) return;

    playSound("click");
    vibrate(30);

    const newMember: SavedPlayer = { name: trimmedName, avatar: newMemberAvatar };
    setSelectedMembers((current) => [...current, newMember]);
    setNewMemberName("");
    setNewMemberAvatar("👤");
  };

  const removeMemberFromSelection = (name: string) => {
    playSound("click");
    vibrate(20);
    setSelectedMembers((current) => current.filter((m) => m.name !== name));
  };

  const handleAddSavedName = () => {
    const trimmed = newSavedName.trim();
    if (!trimmed) return;
    playSound("click");
    vibrate(30);
    addPlayers([{ name: trimmed, avatar: "👤" }]);
    setNewSavedName("");
  };

  const handleClearAllNames = () => {
    clearAllPlayers();
    setShowClearAllDialog(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <span className="text-4xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === "list" && (tab === "groups" ? "اللاعبين والمجموعات" : "اللاعبين والمجموعات")}
              {mode === "create" && "إنشاء مجموعة جديدة"}
              {mode === "edit" && "تعديل المجموعة"}
            </h2>
          </div>

          {/* Tabs (only in list mode) */}
          {mode === "list" && (
            <div className="flex gap-2 mb-4 p-1 rounded-2xl bg-secondary/50">
              <button
                onClick={() => {
                  playSound("click");
                  setTab("names");
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tab === "names" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
              >
                <User size={14} />
                الأسماء ({savedPlayers.length})
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setTab("groups");
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tab === "groups" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
              >
                <Users size={14} />
                المجموعات ({groups.length})
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* NAMES TAB */}
            {mode === "list" && tab === "names" && (
              <div className="space-y-3">
                {/* Add new name */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSavedName}
                    onChange={(e) => setNewSavedName(e.target.value.slice(0, 20))}
                    placeholder="اسم جديد..."
                    maxLength={20}
                    className="flex-1 text-sm py-2 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSavedName();
                    }}
                  />
                  <button
                    onClick={handleAddSavedName}
                    disabled={!newSavedName.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {savedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User size={48} className="mx-auto mb-3 opacity-50" />
                    <p>ما في أسماء محفوظة</p>
                    <p className="text-sm">ضيف أسماء عشان تستخدمها بكل الألعاب</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {savedPlayers.map((player, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-secondary rounded-xl text-sm flex items-center gap-2"
                        >
                          <span>{player.avatar}</span>
                          <span className="font-medium">{player.name}</span>
                          <button
                            onClick={() => {
                              playSound("click");
                              vibrate(20);
                              removePlayer(player.name);
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowClearAllDialog(true)}
                      className="w-full py-2 text-xs text-destructive/80 hover:text-destructive flex items-center justify-center gap-1.5 mt-3"
                    >
                      <Trash2 size={14} />
                      امسح الكل
                    </button>
                  </>
                )}
              </div>
            )}

            {/* GROUPS LIST */}
            {mode === "list" && tab === "groups" && (
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>لا توجد مجموعات محفوظة</p>
                    <p className="text-sm">أنشئ مجموعة لحفظ اللاعبين المفضلين</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <div key={group.id} className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">👥</span>
                            <div>
                              <h3 className="font-bold">{group.name}</h3>
                              <p className="text-xs text-muted-foreground">{group.members.length} لاعبين</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="p-2 rounded-xl bg-secondary hover:bg-primary/20 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(group.id)}
                              className="p-2 rounded-xl bg-secondary hover:bg-imposter/20 transition-colors text-imposter"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Members preview */}
                        <div className="flex flex-wrap gap-1.5">
                          {group.members.slice(0, 6).map((member, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-background/50 rounded-lg text-xs flex items-center gap-1"
                            >
                              {member.avatar} {member.name}
                            </span>
                          ))}
                          {group.members.length > 6 && (
                            <span className="px-2 py-1 bg-background/50 rounded-lg text-xs text-muted-foreground">
                              +{group.members.length - 6}
                            </span>
                          )}
                        </div>

                        {onSelectGroup && (
                          <button
                            onClick={() => handleSelectGroup(group)}
                            className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold rounded-xl transition-colors"
                          >
                            استخدام هذه المجموعة ✓
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCreateNew}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus size={20} />
                  إنشاء مجموعة جديدة
                </button>
              </div>
            )}

            {/* CREATE / EDIT MODE */}
            {(mode === "create" || mode === "edit") && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">اسم المجموعة</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="مثال: العائلة، الأصدقاء..."
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    الأعضاء المختارون ({selectedMembers.length})
                  </label>
                  {selectedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMembers.map((member, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-primary/20 rounded-xl text-sm flex items-center gap-2"
                        >
                          {member.avatar} {member.name}
                          <button
                            onClick={() => removeMemberFromSelection(member.name)}
                            className="text-muted-foreground hover:text-imposter"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">اختر 3 لاعبين على الأقل</p>
                  )}
                </div>

                {savedPlayers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      اختر من اللاعبين المحفوظين
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {savedPlayers.map((player, idx) => {
                        const isSelected = selectedMembers.some(
                          (m) => m.name.toLowerCase() === player.name.toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleMember(player)}
                            className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors ${
                              isSelected ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-secondary/80"
                            }`}
                          >
                            {player.avatar} {player.name}
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  {!showAddMember ? (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="w-full py-2.5 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} />
                      إضافة لاعب جديد
                    </button>
                  ) : (
                    <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="اسم اللاعب"
                          className="flex-1 px-3 py-2 bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={20}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddMember(false)}
                          className="flex-1 py-2 bg-secondary rounded-lg font-medium"
                        >
                          إغلاق
                        </button>
                        <button
                          onClick={handleAddNewMember}
                          disabled={!newMemberName.trim()}
                          className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg font-medium disabled:opacity-50"
                        >
                          حفظ وإضافة آخر +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      resetForm();
                      setMode("list");
                    }}
                    className="flex-1 py-3 bg-secondary rounded-xl font-bold"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleSaveGroup}
                    disabled={!groupName.trim() || selectedMembers.length < 3}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mode === "edit" ? "حفظ التعديلات" : "إنشاء المجموعة"} ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Group Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المجموعة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المجموعة؟ لن يتم حذف اللاعبين المحفوظين.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-secondary">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteGroup(deleteConfirmId)}
              className="bg-imposter text-white hover:bg-imposter/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Names Confirmation */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">🗑️ مسح كل الأسماء؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              هل أنت متأكد؟ لن يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="flex-1 m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllNames}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              نعم، امسح الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupManagementModal;
