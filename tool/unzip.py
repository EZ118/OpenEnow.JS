import zipfile
import os
import xmltodict

CoursewareName = "Courseware"
SlideNum = 0

def load_json(xml_path):
    xml_file = open(xml_path, 'rb')
    xml_str = xml_file.read()
    json = xmltodict.parse(xml_str)
    return json

fpath = "../sample/courseware.enbx"#input("FILE: ")   #在此填写课件路径（相对于src目录）
dpath = "./" + os.path.basename(fpath).split('.')[0] + "/"


try:    
    import shutil
    shutil.rmtree(dpath)

    print("[+] DelDir Successfully")
except:
    print("[-] DelDir Failed")


#Unzip
with zipfile.ZipFile(fpath) as zf:
   zf.extractall(path=dpath)

