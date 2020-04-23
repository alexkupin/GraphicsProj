using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace Obj_to_JS_Macro
{
    class Program
    {
        static void Main(string[] args)
        {
            string InPath;
            string OutPath;
            InPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop) + @"\DeskTopFolders\Clarkson\ComputerGraphics\Project2\GraphicsProjmaster\Merry_go_Round_AR_fixed.obj";
            OutPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop) + @"\DeskTopFolders\Clarkson\ComputerGraphics\Project2\GraphicsProjmaster\MGR.js";

            string[] obj = File.ReadAllLines(InPath);
            
            //initializes the types of vectors in an obj
            List<string> Verticies=new List<string>();
            List<string> VerticiesNormals =new List<string>();
            List<string> Faces =new List<string>();

            //pulls each line and converts it into a JavaScript format
            foreach(var line in obj)
            {
                if(line.Substring(0,2)=="v,")
                {
                    
                    Verticies.Add("vec4("+line.Substring(2)+",1.0),");
                }
                else if(line.Substring(0,2)=="vn")
                {
                    VerticiesNormals.Add("vec4(" + line.Substring(3) + ", 1.0),");
                }
                else if(line[0]=='f')
                {
                    string editedLine = line;

                    //this is going to be an exceedingly dumbset of calls but bear with me

                    string faceline = editedLine.Substring(2, line.IndexOf('/')-2);
                    editedLine = editedLine.Substring(editedLine.IndexOf(',') + 1);
                    editedLine = editedLine.Substring(editedLine.IndexOf(',') + 1);
                    faceline +="," + editedLine.Substring(0, editedLine.IndexOf('/'));
                    editedLine = editedLine.Substring(editedLine.IndexOf(',')+1);
                    faceline += ","+editedLine.Substring(0, editedLine.IndexOf('/')) + ",";

                    
                    Faces.Add(faceline);
                   
                    
                }
            }
            File.WriteAllText(OutPath, "function getVerticies(){\r\n");
            File.AppendAllText(OutPath, "verticies = [");
            File.AppendAllLines(OutPath, Verticies);
            File.AppendAllText(OutPath, "];\r\n return verticies;\r\n }");

            File.AppendAllText(OutPath, "function getNormals(){\r\n");
            File.AppendAllText(OutPath, "vns = [");
            File.AppendAllLines(OutPath, VerticiesNormals);
            File.AppendAllText(OutPath, "];\r\n return vns;\r\n }");

            File.AppendAllText(OutPath, "function getFaces(){\r\n");
            File.AppendAllText(OutPath, "faces = [");
            File.AppendAllLines(OutPath, Faces);
            File.AppendAllText(OutPath, "];\r\n return faces;\r\n }");

            Console.ReadLine();
            
        }
    }
}
