import { StorageDTO } from "./StorageDTO";

export const Storage = {

  StorageDTO,

  get<T>(key: string , decrypt: boolean = false): T | null {
    return StorageDTO?.read<T>(key , decrypt )?.data || null
  },

  set<T>(key: string , data: T , decrypt: boolean = false , timer: number = -1) {
    StorageDTO.save(
      new StorageDTO(key , data , timer) , decrypt
    )
  },

  del(key: string) {
    StorageDTO.delet(key)
  }

}