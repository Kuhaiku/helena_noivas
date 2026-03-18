import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ConfigHorarios() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Horários da Loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {diasSemana.map((dia, index) => (
          <div key={dia} className="flex items-center justify-between p-3 border rounded-md">
            <span className="w-24 font-medium">{dia}</span>
            <div className="flex items-center gap-4">
              <Input type="time" defaultValue="09:00" className="w-32" />
              <span className="text-sm text-gray-500">até</span>
              <Input type="time" defaultValue="18:00" className="w-32" />
              <div className="flex items-center gap-2 ml-4">
                <Switch defaultChecked={index !== 0} />
                <span className="text-sm">Aberto</span>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button className="bg-[#ee2b4b] hover:bg-[#d41c3a] text-white">
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}