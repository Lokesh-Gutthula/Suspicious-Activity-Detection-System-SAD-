import os


def change_class_id_from_to(label_folder, old_class_id, new_class_id):
    for label_file in os.listdir(label_folder):
        if label_file.endswith('.txt'):  # Only process .txt files
            label_path = os.path.join(label_folder, label_file)

            # Read the file and modify lines
            with open(label_path, 'r') as file:
                lines = file.readlines()

            updated_lines = []
            for line in lines:
                parts = line.strip().split()
                if parts:  # Ensure line is not empty
                    # Change class ID only if it matches old_class_id
                    if parts[0] == str(old_class_id):
                        # Change to the new class ID
                        parts[0] = str(new_class_id)
                    updated_lines.append(" ".join(parts) + "\n")

            # Write the updated lines back to the file
            with open(label_path, 'w') as file:
                file.writelines(updated_lines)

    print(
        f"Changed all class IDs from {old_class_id} to {new_class_id} in all label files in {label_folder}.")


# Example usage
label_folder_path = "C:/Users/Dad's Lovely Son/Downloads/glass window.v1i.yolov8/valid/labels"
old_class_id = 0
new_class_id = 1
change_class_id_from_to(label_folder_path, old_class_id, new_class_id)


# import os


# def change_class_id_to(label_folder, new_class_id):

#     for label_file in os.listdir(label_folder):
#         if label_file.endswith('.txt'):  # Only process .txt files
#             label_path = os.path.join(label_folder, label_file)

#             # Read the file and modify lines
#             with open(label_path, 'r') as file:
#                 lines = file.readlines()

#             updated_lines = []
#             for line in lines:
#                 parts = line.strip().split()
#                 if parts:  # Ensure line is not empty
#                     parts[0] = str(new_class_id)  # Change the class ID
#                     updated_lines.append(" ".join(parts) + "\n")

#             # Write the updated lines back to the file
#             with open(label_path, 'w') as file:
#                 file.writelines(updated_lines)

#     print(f"Changed all class IDs to {
#           new_class_id} in all label files in {label_folder}.")


# # Example usage
# label_folder_path = "C:/Users/Dad's Lovely Son/Downloads/thieves- gun- knife- mask detection.v1i.yolov8-obb/train/labels"
# new_class_id = 0
# change_class_id_to(label_folder_path, new_class_id)
