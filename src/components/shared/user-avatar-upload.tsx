"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export interface UserAvatarUploadProps {
    currentImageId?: string;
    onImageUpload: (storageId: string) => void;
    onImageRemove: () => void;
}

export const UserAvatarUpload: React.FC<UserAvatarUploadProps> = ({
    currentImageId,
    onImageUpload,
    onImageRemove
}) => {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const [storageId, setStorageId] = useState<string | undefined>(currentImageId);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get the URL for the current storage ID
    const storageUrl = useQuery(api.files.getStorageUrl, 
        storageId ? { storageId } : "skip"
    );

    // Update storage ID when currentImageId changes
    useEffect(() => {
        setStorageId(currentImageId);
    }, [currentImageId]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            
            const { storageId: newStorageId } = await result.json();
            setStorageId(newStorageId);
            onImageUpload(newStorageId);
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setStorageId(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onImageRemove();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
            />
            
            <div className="relative">
                <Avatar className="h-24 w-24">
                    {storageUrl && (
                        <AvatarImage 
                            src={storageUrl}
                            alt="User avatar"
                            className="object-cover"
                            onError={() => {
                                console.error("Image load error:", storageUrl);
                                setStorageId(undefined);
                            }}
                        />
                    )}
                    <AvatarFallback>
                        {isUploading ? "Loading..." : "Upload"}
                    </AvatarFallback>
                </Avatar>
                
                {storageUrl && !isUploading && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveImage}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
            >
                {isUploading ? (
                    "Uploading..."
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        {storageUrl ? "Change Image" : "Upload Image"}
                    </>
                )}
            </Button>

            {/* {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2">
                    Storage ID: {storageId || 'none'}
                    <br />
                    URL: {storageUrl || 'none'}
                </div>
            )} */}
        </div>
    );
} 