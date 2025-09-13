// 加密解密
function xorEncryptDecrypt(input: string, key: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
  const xorResult = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  output += String.fromCharCode(xorResult);
  }
  return output;
}

let key: string = 'asfsajuoawslgonmas52d4g6s5g5ds4hg65ds'

export class StorageDTO<T> {

  // 存储的键
  public key: string = ''

  // 存储的数据
  public data: T = null

  // 存储时间
  public timer: number = -1

  // 构造器
  constructor(key: string , data: T , timer: number = -1) {
    this.key = key
    this.data = data
    this.timer = timer
  }

  // 删除
  public static delet(key: string) {
    localStorage.removeItem(key)
  }

  // 存储
  public static save(storage: StorageDTO<unknown> , encipher: boolean = false) {
    const storageData = JSON.stringify(storage)
    localStorage.setItem(storage.key , encipher ? xorEncryptDecrypt(storageData, key) : storageData)
  }

  // 读取
  public static read<T>(key: string , decrypt: boolean = false): StorageDTO<T> {
    const storage = localStorage.getItem(key)
    if (!storage) return null
    try {
      const storageData: StorageDTO<unknown> = JSON.parse(decrypt ? xorEncryptDecrypt(storage, key) : storage)
      if (storageData.timer === -1 || storageData.timer < Date.now())
        return storageData as any
      else 
        StorageDTO.delet(key)
    } catch(e) {}
    return null
  }

}