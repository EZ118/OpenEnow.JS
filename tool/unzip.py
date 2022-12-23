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
    
def copy_dir(src_path, target_path):
	if os.path.isdir(src_path) and os.path.isdir(target_path):		
		filelist_src = os.listdir(src_path)							
		for file in filelist_src:
			path = os.path.join(os.path.abspath(src_path), file)	
			if os.path.isdir(path):
				path1 = os.path.join(os.path.abspath(target_path), file)	
				if not os.path.exists(path1):						
					os.mkdir(path1)
				copy_dir(path,path1)			
			else:								
				with open(path, 'rb') as read_stream:
					contents = read_stream.read()
					path1 = os.path.join(target_path, file)
					with open(path1, 'wb') as write_stream:
						write_stream.write(contents)
		return 	True	
						
	else:
		return False

fpath = "../sample/courseware.enbx"#input("FILE: ")   #在此填写课件路径（相对于src目录）
dpath = "./" + os.path.basename(fpath).split('.')[0] + "/"
try:
    os.mkdir(dpath)
    print("[+] MkDir Successfully")
except:
    print("[-] MkDir Failed")
try:
    os.mkdir(dpath + "Slides/")
    print("[+] MkDir Successfully")
except:
    print("[-] MkDir Failed")
try:
    os.mkdir(dpath + "Resources/")
    print("[+] MkDir Successfully")
except:
    print("[-] MkDir Failed")


#Unzip
with zipfile.ZipFile(fpath) as zf:
   zf.extractall(path="./Temp/")



copy_dir("./Temp/Resources/", dpath + "Resources/")
copy_dir("./Temp/Slides/", dpath + "Slides/")
import shutil
shutil.rmtree("./Temp/")
